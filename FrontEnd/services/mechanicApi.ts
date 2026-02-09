import { databases } from "./appwriteClient";
import { ID } from "appwrite";

/* ================= CONFIG ================= */
export const DATABASE_ID = "692d76ce00304286ce3d";
export const MECHANICS_COLLECTION_ID = "mechanic_rigistr";

/* ================= TYPES ================= */
export interface MechanicPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  Role: string[];              // Bike Mechanic, Car Mechanic etc
  TypeOfVehicle: string[];     // Normal / EV
  Address: string;
  Aadhaar_Number: string;
  latitude: number;
  longitude: number;
  profile_completed?: boolean;
}

/* ================= UPDATE LIVE LOCATION (Optimized) ================= */
export const updateMechanicLocation = async (
  mechanicId: string,
  latitude: number,
  longitude: number,
  heading?: number
) => {
  try {
    // Validate coordinates
    if (!mechanicId || typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.warn('Invalid location data:', { mechanicId, latitude, longitude });
      return null;
    }

    // Normalize coordinates
    const normalizedLat = Number(latitude.toFixed(6));
    const normalizedLng = Number(longitude.toFixed(6));
    const normalizedHeading = heading !== undefined ? Number(heading.toFixed(1)) : 0;

    // Check if coordinates are valid
    if (isNaN(normalizedLat) || isNaN(normalizedLng)) {
      console.warn('NaN coordinates detected');
      return null;
    }

    // Update in Appwrite
    const result = await databases.updateDocument(
      DATABASE_ID,
      MECHANICS_COLLECTION_ID,
      mechanicId,
      {
        latitude: normalizedLat,
        longitude: normalizedLng,
        heading: normalizedHeading,
        lastLocationUpdate: new Date().toISOString(),
      }
    );

    console.log('Location updated successfully:', {
      id: mechanicId,
      lat: normalizedLat,
      lng: normalizedLng,
      heading: normalizedHeading,
    });

    return result;
  } catch (error) {
    console.error('Failed to update mechanic location:', error);
    
    // Don't throw - fail gracefully
    return null;
  }
};

/* ================= GET MECHANIC ================= */
export const getMechanicById = async (mechanicId: string) => {
  try {
    return await databases.getDocument(
      DATABASE_ID,
      MECHANICS_COLLECTION_ID,
      mechanicId
    );
  } catch (error) {
    console.error('Failed to get mechanic:', error);
    return null;
  }
};

/* ================= REGISTER MECHANIC ================= */
export const registerMechanic = async (data: MechanicPayload) => {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      MECHANICS_COLLECTION_ID,
      ID.unique(),
      {
        Name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        Phone: data.phone || '',
        Role: data.Role,
        TypeOfVehicle: data.TypeOfVehicle,
        Address: data.Address,
        Aadhaar_Number: data.Aadhaar_Number,
        latitude: data.latitude,
        longitude: data.longitude,
        profile_completed: false,
        createdAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Failed to register mechanic:', error);
    throw error;
  }
};

/* ================= COMPLETE PROFILE ================= */
export const markProfileCompleted = async (mechanicId: string) => {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      MECHANICS_COLLECTION_ID,
      mechanicId,
      {
        profile_completed: true,
        profileCompletedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Failed to mark profile completed:', error);
    return null;
  }
};