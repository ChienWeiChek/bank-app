import { Router } from "oak";
import { z } from "zod";
import { requireAuth, AuthenticatedContext } from "../middleware/auth.middleware.ts";
import { query } from "../config/database.ts";
import { Errors, AppError } from "../middleware/error.middleware.ts";
import { ContactResponse, CreateContactRequest, UpdateContactRequest } from "../types/contact.types.ts";

const contactsRouter = new Router();

// Validation schemas
const createContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email format").optional(),
});

const updateContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  email: z.string().email("Invalid email format").optional(),
});

// Get all contacts for authenticated user
contactsRouter.get("/api/contacts", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;

  const result = await query(
    `SELECT id, name, phone_number as "phoneNumber", email, created_at as "createdAt"
     FROM contacts 
     WHERE user_id = $1 
     ORDER BY name ASC`,
    [userId]
  );

  const contacts: ContactResponse[] = result.rows.map(contact => ({
    id: contact.id,
    name: contact.name,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
  }));

  ctx.response.body = { contacts };
}));

// Get specific contact
contactsRouter.get("/api/contacts/:id", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  const contactId = ctx.params.id;

  const result = await query(
    `SELECT id, name, phone_number as "phoneNumber", email, created_at as "createdAt"
     FROM contacts 
     WHERE id = $1 AND user_id = $2`,
    [contactId, userId]
  );

  if (result.rows.length === 0) {
    throw Errors.CONTACT_NOT_FOUND;
  }

  const contact = result.rows[0];
  
  const contactResponse: ContactResponse = {
    id: contact.id,
    name: contact.name,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
  };

  ctx.response.body = { contact: contactResponse };
}));

// Create new contact
contactsRouter.post("/api/contacts", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  let body: CreateContactRequest;
  
  try {
    body = await ctx.request.body().value;
    createContactSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError("VALIDATION_ERROR", error.errors[0].message);
    }
    throw Errors.VALIDATION_ERROR;
  }

  // Check if contact with same phone number already exists for this user
  const existingContact = await query(
    "SELECT id FROM contacts WHERE user_id = $1 AND phone_number = $2",
    [userId, body.phoneNumber]
  );

  if (existingContact.rows.length > 0) {
    throw Errors.DUPLICATE_CONTACT;
  }

  // Create contact
  const result = await query(
    `INSERT INTO contacts (user_id, name, phone_number, email) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, name, phone_number as "phoneNumber", email, created_at as "createdAt"`,
    [userId, body.name, body.phoneNumber, body.email || null]
  );

  const contact = result.rows[0];
  
  const contactResponse: ContactResponse = {
    id: contact.id,
    name: contact.name,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
  };

  ctx.response.status = 201;
  ctx.response.body = { contact: contactResponse };
}));

// Update contact
contactsRouter.put("/api/contacts/:id", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  const contactId = ctx.params.id;
  let body: UpdateContactRequest;
  
  try {
    body = await ctx.request.body().value;
    updateContactSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError("VALIDATION_ERROR", error.errors[0].message);
    }
    throw Errors.VALIDATION_ERROR;
  }

  // Verify contact exists and belongs to user
  const existingContact = await query(
    "SELECT id FROM contacts WHERE id = $1 AND user_id = $2",
    [contactId, userId]
  );

  if (existingContact.rows.length === 0) {
    throw Errors.CONTACT_NOT_FOUND;
  }

  // Check for duplicate phone number if updating phone
  if (body.phoneNumber) {
    const duplicateContact = await query(
      "SELECT id FROM contacts WHERE user_id = $1 AND phone_number = $2 AND id != $3",
      [userId, body.phoneNumber, contactId]
    );

    if (duplicateContact.rows.length > 0) {
      throw Errors.DUPLICATE_CONTACT;
    }
  }

  // Build update query dynamically
  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  if (body.name) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(body.name);
  }

  if (body.phoneNumber) {
    paramCount++;
    updates.push(`phone_number = $${paramCount}`);
    params.push(body.phoneNumber);
  }

  if (body.email !== undefined) {
    paramCount++;
    updates.push(`email = $${paramCount}`);
    params.push(body.email || null);
  }

  if (updates.length === 0) {
    throw new AppError("VALIDATION_ERROR", "No fields to update", 400);
  }

  updates.push("updated_at = NOW()");

  paramCount++;
  params.push(contactId);
  paramCount++;
  params.push(userId);

  const result = await query(
    `UPDATE contacts 
     SET ${updates.join(", ")}
     WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
     RETURNING id, name, phone_number as "phoneNumber", email, created_at as "createdAt", updated_at as "updatedAt"`,
    params
  );

  const contact = result.rows[0];
  
  const contactResponse: ContactResponse = {
    id: contact.id,
    name: contact.name,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
  };

  ctx.response.body = { contact: contactResponse };
}));

// Delete contact
contactsRouter.delete("/api/contacts/:id", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  const contactId = ctx.params.id;

  const result = await query(
    "DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id",
    [contactId, userId]
  );

  if (result.rowCount === 0) {
    throw Errors.CONTACT_NOT_FOUND;
  }

  ctx.response.body = { message: "Contact deleted successfully" };
}));

export { contactsRouter };
