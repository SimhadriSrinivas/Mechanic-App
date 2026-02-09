import { Client, Account, Databases, Query, Models } from "appwrite";

// ---------------- CONFIG ----------------
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("692d29f20030da54db2d"); // 🔴 replace

export const account = new Account(client);
export const databases = new Databases(client);

// 🔴 replace these IDs
const DATABASE_ID = "692d76ce00304286ce3d";
const USER_COLLECTION_ID = "otp_database_id";

// ---------------- TYPES ----------------
export interface UserProfile {
  $id: string;
  name: string;
  phone: string;
  role: "user" | "mechanic";
}

// ---------------- FUNCTIONS ----------------

// Get logged-in Appwrite user
export const getCurrentUser = async (): Promise<Models.User> => {
  try {
    return await account.get();
  } catch (error) {
    throw new Error("User not logged in");
  }
};

// Get user profile by phone number
export const getUserProfile = async (phone: string): Promise<UserProfile> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID,
      [Query.equal("phone", phone)]
    );

    if (response.documents.length === 0) {
      throw new Error("User profile not found");
    }

    return response.documents[0] as unknown as UserProfile;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch user profile");
  }
};

// Create user profile (after OTP login)
export const createUserProfile = async (
  userId: string,
  name: string,
  phone: string,
  role: "user" | "mechanic"
) => {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      userId,
      {
        name,
        phone,
        role,
      }
    );
  } catch (error: any) {
    throw new Error(error.message || "Failed to create profile");
  }
};

// Logout
export const logoutUser = async () => {
  await account.deleteSession("current");
};
