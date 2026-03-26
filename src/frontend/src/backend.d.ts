import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    id: bigint;
    propertyType: string;
    name: string;
    createdAt: bigint;
    email: string;
    urgencyTag: UrgencyTag;
    conversionStatus: ConversionStatus;
    notes: string;
    phone: string;
    budgetTag: BudgetTag;
    budgetRange: string;
    location: string;
    timeline: string;
}
export interface UserProfile {
    name: string;
}
export enum BudgetTag {
    mid = "mid",
    premium = "premium",
    standard = "standard"
}
export enum ConversionStatus {
    new_ = "new",
    lost = "lost",
    contacted = "contacted",
    converted = "converted",
    qualified = "qualified"
}
export enum UrgencyTag {
    hot = "hot",
    cold = "cold",
    warm = "warm"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteLead(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeadStats(): Promise<{
        total: bigint;
        countsByBudgetTag: Array<[string, bigint]>;
        countsByStatus: Array<[string, bigint]>;
    }>;
    getLeads(): Promise<Array<Lead>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitLead(lead: Lead): Promise<bigint>;
    updateLeadNotes(id: bigint, notes: string): Promise<void>;
    updateLeadStatus(id: bigint, status: ConversionStatus): Promise<void>;
}
