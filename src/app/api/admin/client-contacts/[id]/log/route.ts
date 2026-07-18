import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ClientContact from "@/models/ClientContact";
import Deal from "@/models/Deal";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check first — avoid unnecessary DB connection for unauthorized requests
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (userRole === "participant") {
      return NextResponse.json(
        { error: "Forbidden: Only GWD Admins and Sales Leads can log client interactions." },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { type, summary, outcome, handledBy } = body;

    let contact = await ClientContact.findOne({ dealId: id });
    if (!contact) {
      // Create if not exists (e.g. legacy deal)
      const deal = await Deal.findById(id);
      if (!deal) {
        return NextResponse.json({ error: "Deal not found" }, { status: 404 });
      }
      contact = await ClientContact.create({
        dealId: deal._id,
        businessName: deal.clientBusiness,
        contactPerson: deal.clientName,
        phone: deal.clientPhone || "Vaulted",
        email: deal.clientEmail || "",
        interactions: [],
      });
    }

    contact.interactions.push({
      date: new Date(),
      type: type || "call",
      handledBy: handledBy || (session.user as any)?.id || contact.dealId,
      summary: summary || "Interaction logged by GWD Admin.",
      outcome: outcome || "Updated",
    });

    await contact.save();

    return NextResponse.json({ message: "Interaction logged successfully", contact });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
