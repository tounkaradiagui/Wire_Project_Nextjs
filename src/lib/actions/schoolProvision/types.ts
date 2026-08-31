import {
    School,
    Subscription,
    UserProfile,
    SchoolRegistrationRequest,
} from "@prisma/client";

export interface CurrentState {
    success: boolean;
    error: string | null;
}

export interface ProvisionResult {
    school: School;
    profile: UserProfile;
    subscription: Subscription;
    request: SchoolRegistrationRequest;
    clerkUserId: string;
}

export interface ClerkAdminData {
    clerkUserId: string;
    password: string;
}

export interface CredentialsPayload {
    email: string;
    username: string;
    password: string;
    schoolName: string;
}