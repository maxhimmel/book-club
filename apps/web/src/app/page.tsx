import { signOut, withAuth } from "@workos-inc/authkit-nextjs";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const { user } = await withAuth();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Book Club</h1>
        <p className="text-muted-foreground text-lg">
          Next.js + Convex + WorkOS AuthKit, wired up and ready.
        </p>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <a href="/sign-in" className={buttonVariants()}>
            Sign in
          </a>
          <a href="/sign-up" className={buttonVariants({ variant: "outline" })}>
            Sign up
          </a>
        </div>
      )}
    </main>
  );
}
