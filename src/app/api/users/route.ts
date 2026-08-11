import { NextResponse } from "next/server";
import { 
  getStoreUsers, 
  updateUserTier, 
  addUserGamePurchase, 
  mergeClerkUsers,
  cancelUserSubscription,
  activateUserSubscription
} from "@/lib/dataStore";

export async function GET() {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    let fetchedLiveClerkUsers = false;

    if (secretKey && secretKey.startsWith("sk_")) {
      try {
        const { createClerkClient } = await import("@clerk/nextjs/server");
        const clerk = createClerkClient({ secretKey });
        const clerkUsersResponse = await clerk.users.getUserList({ limit: 100 });
        
        if (clerkUsersResponse && Array.isArray(clerkUsersResponse.data)) {
          mergeClerkUsers(clerkUsersResponse.data);
          fetchedLiveClerkUsers = true;
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.warn("Clerk API live fetch warning:", error?.message || err);
      }
    }

    const users = getStoreUsers();
    return NextResponse.json({
      success: true,
      usersCount: users.length,
      users,
      fetchedLiveClerkUsers,
      source: fetchedLiveClerkUsers ? "Live Clerk Auth API" : "Nimbus Admin Real-Time Store"
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, tier, gameTitle } = body;
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (action === "update_tier" && userId && tier) {
      const updatedUser = updateUserTier(userId, tier);
      
      // Update Clerk public metadata if Clerk API is available
      if (secretKey && secretKey.startsWith("sk_") && updatedUser?.clerkId) {
        try {
          const { createClerkClient } = await import("@clerk/nextjs/server");
          const clerk = createClerkClient({ secretKey });
          await clerk.users.updateUserMetadata(updatedUser.clerkId, {
            publicMetadata: { tier }
          });
        } catch (err) {
          console.warn("Failed to push metadata to Clerk:", err);
        }
      }

      return NextResponse.json({ success: true, user: updatedUser, message: `Updated tier to ${tier}` });
    }

    if (action === "cancel_subscription" && userId) {
      const updatedUser = cancelUserSubscription(userId);
      if (secretKey && secretKey.startsWith("sk_") && updatedUser?.clerkId) {
        try {
          const { createClerkClient } = await import("@clerk/nextjs/server");
          const clerk = createClerkClient({ secretKey });
          await clerk.users.updateUserMetadata(updatedUser.clerkId, {
            publicMetadata: { subscriptionStatus: "Cancelled" }
          });
        } catch (err) {
          console.warn("Failed to push metadata to Clerk:", err);
        }
      }
      return NextResponse.json({ success: true, user: updatedUser, message: "Subscription cancelled successfully" });
    }

    if (action === "activate_subscription" && userId) {
      const updatedUser = activateUserSubscription(userId);
      if (secretKey && secretKey.startsWith("sk_") && updatedUser?.clerkId) {
        try {
          const { createClerkClient } = await import("@clerk/nextjs/server");
          const clerk = createClerkClient({ secretKey });
          await clerk.users.updateUserMetadata(updatedUser.clerkId, {
            publicMetadata: { subscriptionStatus: "Active" }
          });
        } catch (err) {
          console.warn("Failed to push metadata to Clerk:", err);
        }
      }
      return NextResponse.json({ success: true, user: updatedUser, message: "Subscription activated successfully" });
    }

    if (action === "add_game_purchase" && userId && gameTitle) {
      const updatedUser = addUserGamePurchase(userId, gameTitle);
      
      // Update Clerk metadata if Clerk API is available
      if (secretKey && secretKey.startsWith("sk_") && updatedUser?.clerkId) {
        try {
          const { createClerkClient } = await import("@clerk/nextjs/server");
          const clerk = createClerkClient({ secretKey });
          const currentPurchases = updatedUser.gamesPurchased || [];
          await clerk.users.updateUserMetadata(updatedUser.clerkId, {
            publicMetadata: { gamesPurchased: currentPurchases }
          });
        } catch (err) {
          console.warn("Failed to push game metadata to Clerk:", err);
        }
      }

      return NextResponse.json({ success: true, user: updatedUser, message: `Unlocked ${gameTitle} for user` });
    }

    return NextResponse.json({ success: false, error: "Invalid action or parameters" }, { status: 400 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
