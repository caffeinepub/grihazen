import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type BudgetTag = {
    #premium;
    #mid;
    #standard;
  };

  type UrgencyTag = {
    #hot;
    #warm;
    #cold;
  };

  type ConversionStatus = {
    #new;
    #contacted;
    #qualified;
    #converted;
    #lost;
  };

  // Lead type
  type Lead = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    propertyType : Text;
    budgetRange : Text;
    location : Text;
    timeline : Text;
    createdAt : Int;
    budgetTag : BudgetTag;
    urgencyTag : UrgencyTag;
    conversionStatus : ConversionStatus;
    notes : Text;
  };

  // User Profile type
  public type UserProfile = {
    name : Text;
  };

  // Internal state
  var nextLeadId = 1;

  let leads = Map.empty<Nat, Lead>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Tagging logic
  module BudgetTag {
    public func toText(budgetTag : BudgetTag) : Text {
      switch (budgetTag) {
        case (#premium) { "Premium" };
        case (#mid) { "Mid" };
        case (#standard) { "Standard" };
      };
    };
  };

  module UrgencyTag {
    public func toText(urgencyTag : UrgencyTag) : Text {
      switch (urgencyTag) {
        case (#hot) { "Hot" };
        case (#warm) { "Warm" };
        case (#cold) { "Cold" };
      };
    };
  };

  module ConversionStatus {
    public func toText(conversionStatus : ConversionStatus) : Text {
      switch (conversionStatus) {
        case (#new) { "New" };
        case (#contacted) { "Contacted" };
        case (#qualified) { "Qualified" };
        case (#converted) { "Converted" };
        case (#lost) { "Lost" };
      };
    };
  };

  func tagBudget(budgetRange : Text) : BudgetTag {
    if (budgetRange.contains(#text "50L+")) { #premium } else if (budgetRange.contains(#text "20-50L")) {
      #mid;
    } else if (budgetRange.contains(#text "10-20L")) {
      #mid;
    } else { #standard };
  };

  func tagUrgency(timeline : Text) : UrgencyTag {
    if (timeline == "Immediately") { #hot } else if (timeline == "1-3 months") {
      #warm;
    } else { #cold };
  };

  func createLeadId() : Nat {
    let leadId = nextLeadId;
    nextLeadId += 1;
    leadId;
  };

  module Lead {
    public func compare(lead1 : Lead, lead2 : Lead) : Order.Order {
      Nat.compare(lead1.id, lead2.id);
    };
  };

  // User Profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Lead management functions

  // Anyone can submit lead
  public shared ({ caller }) func submitLead(lead : Lead) : async Nat {
    if (lead.name.size() < 3) {
      Runtime.trap("Please enter a valid name");
    };
    if (not lead.phone.startsWith(#text "+91")) {
      Runtime.trap("Phone number must start with +91");
    };
    if (lead.phone.size() != 13) {
      Runtime.trap("Please enter a valid phone number");
    };
    let id = createLeadId();
    let newLead : Lead = {
      lead with
      id;
      budgetTag = tagBudget(lead.budgetRange);
      urgencyTag = tagUrgency(lead.timeline);
      createdAt = Time.now();
      conversionStatus = #new;
      notes = "";
    };
    leads.add(id, newLead);
    id;
  };

  public query ({ caller }) func getLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    leads.values().toArray().sort();
  };

  // Mutating lead data
  public shared ({ caller }) func updateLeadStatus(id : Nat, status : ConversionStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (leads.get(id)) {
      case (null) { Runtime.trap("Lead does not exist") };
      case (?lead) {
        leads.add(id, { lead with conversionStatus = status });
      };
    };
  };

  public shared ({ caller }) func updateLeadNotes(id : Nat, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (leads.get(id)) {
      case (null) { Runtime.trap("Lead does not exist") };
      case (?lead) {
        leads.add(id, { lead with notes });
      };
    };
  };

  public shared ({ caller }) func deleteLead(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not leads.containsKey(id)) {
      Runtime.trap("Lead does not exist");
    };
    leads.remove(id);
  };

  public query ({ caller }) func getLeadStats() : async {
    total : Nat;
    countsByStatus : [(Text, Nat)];
    countsByBudgetTag : [(Text, Nat)];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let leadArray = leads.values().toArray();
    let stats = {
      total = 0;
      var new = 0;
      var contacted = 0;
      var qualified = 0;
      var converted = 0;
      var lost = 0;
      var premium = 0;
      var mid = 0;
      var standard = 0;
    };
    for (lead in leadArray.values()) {
      switch (lead.conversionStatus) {
        case (#new) { stats.new += 1 };
        case (#contacted) { stats.contacted += 1 };
        case (#qualified) { stats.qualified += 1 };
        case (#converted) { stats.converted += 1 };
        case (#lost) { stats.lost += 1 };
      };
      switch (lead.budgetTag) {
        case (#premium) { stats.premium += 1 };
        case (#mid) { stats.mid += 1 };
        case (#standard) { stats.standard += 1 };
      };
    };
    {
      total = leadArray.size();
      countsByStatus = [
        ("New", stats.new),
        ("Contacted", stats.contacted),
        ("Qualified", stats.qualified),
        ("Converted", stats.converted),
        ("Lost", stats.lost),
      ];
      countsByBudgetTag = [
        ("Premium", stats.premium),
        ("Mid", stats.mid),
        ("Standard", stats.standard),
      ];
    };
  };
};
