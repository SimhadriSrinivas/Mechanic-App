// services/requests.ts
import {
  databases,
  realtime,
  APPWRITE_DATABASE_ID,
  REQUESTS_COLLECTION_ID,
} from "./appwriteClient";

type Unsubscribe = () => void;

/**
 * createRequest -> returns documentId
 */
export async function createRequest(payload: {
  userId: string;
  userPhone: string;
  service: string;
  vehicleType: string;
  lat: number;
  lng: number;
}) {
  const response = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    "unique()", // let Appwrite generate ID
    {
      ...payload,
      status: "pending",
      createdAt: Date.now(),
      acceptedBy: null,
      mechanicInfo: null,
      mechanicLocation: null,
    }
  );
  return response.$id;
}

/**
 * listenRequest -> subscribe to realtime changes on the request document
 */
export async function listenRequest(
  requestId: string,
  cb: (doc: any) => void
): Promise<Unsubscribe> {
  const path = `databases.${APPWRITE_DATABASE_ID}.collections.${REQUESTS_COLLECTION_ID}.documents.${requestId}`;
  const subscription = await realtime.subscribe(path, (response: any) => {
    if (response?.payload) {
      cb(response.payload);
    }
  });

  return () => subscription.close();
}

export async function cancelRequest(requestId: string) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    requestId,
    { status: "cancelled" }
  );
}

export async function acceptRequest(
  requestId: string,
  mechId: string,
  mechInfo: any
) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    requestId,
    {
      acceptedBy: mechId,
      status: "accepted",
      mechanicInfo: mechInfo,
    }
  );
}

export async function updateMechanicLocation(
  requestId: string,
  lat: number,
  lng: number
) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    requestId,
    {
      mechanicLocation: {
        lat,
        lng,
        updatedAt: Date.now(),
      },
    }
  );
}
