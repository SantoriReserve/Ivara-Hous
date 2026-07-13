"use client";

import { useState, useTransition } from "react";
import {
  adminAddCustomerNoteAction,
  adminAddCustomerTagAction,
  adminDeleteCustomerNoteAction,
  adminRemoveCustomerTagAction,
} from "@/app/actions/admin-crm-actions";
import { SUGGESTED_CUSTOMER_TAGS } from "@/lib/admin/admin-products";
import { formatDateTime } from "@/lib/admin/admin-format";

export function AdminCustomerNotesPanel({
  customerKey,
  notes,
}: {
  customerKey: string;
  notes: Array<{ id: string; body: string; createdBy: string; createdAt: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="space-y-4 border border-black/10 p-6">
      <h3 className="font-serif text-2xl text-black">Internal Notes</h3>
      <p className="font-sans text-sm text-gray-mid">Private to admin — never shown to customers.</p>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          formData.set("customerKey", customerKey);
          setError(null);
          startTransition(async () => {
            const result = await adminAddCustomerNoteAction(formData);
            if (!result.success) {
              setError(result.error);
              return;
            }
            event.currentTarget.reset();
          });
        }}
      >
        <textarea
          name="body"
          rows={3}
          required
          placeholder="Requested support · Potential testimonial · Miami creator…"
          className="luxury-textarea w-full"
        />
        <button
          type="submit"
          disabled={isPending}
          className="border border-black bg-black px-4 py-2 font-sans text-xs uppercase tracking-nav text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Add Note"}
        </button>
      </form>

      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}

      <div className="space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <div key={note.id} className="border border-black/10 p-4">
              <p className="font-sans text-sm text-black">{note.body}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-sans text-xs text-gray-muted">
                  {note.createdBy} · {formatDateTime(note.createdAt)}
                </p>
                <button
                  type="button"
                  className="font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
                  onClick={() => {
                    const formData = new FormData();
                    formData.set("noteId", note.id);
                    formData.set("customerKey", customerKey);
                    startTransition(async () => {
                      await adminDeleteCustomerNoteAction(formData);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="font-sans text-sm text-gray-mid">No notes yet.</p>
        )}
      </div>
    </section>
  );
}

export function AdminCustomerTagsPanel({
  customerKey,
  tags,
}: {
  customerKey: string;
  tags: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="space-y-4 border border-black/10 p-6">
      <h3 className="font-serif text-2xl text-black">Customer Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={isPending}
              onClick={() => {
                const formData = new FormData();
                formData.set("customerKey", customerKey);
                formData.set("tag", tag);
                startTransition(async () => {
                  await adminRemoveCustomerTagAction(formData);
                });
              }}
              className="border border-black bg-black px-3 py-1.5 font-sans text-xs uppercase tracking-nav text-white"
              title="Click to remove"
            >
              {tag} ×
            </button>
          ))
        ) : (
          <p className="font-sans text-sm text-gray-mid">No tags yet.</p>
        )}
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          formData.set("customerKey", customerKey);
          setError(null);
          startTransition(async () => {
            const result = await adminAddCustomerTagAction(formData);
            if (!result.success) {
              setError(result.error);
              return;
            }
            event.currentTarget.reset();
          });
        }}
      >
        <input
          name="tag"
          list="suggested-customer-tags"
          placeholder="Add tag"
          className="luxury-input min-w-[12rem] flex-1"
          required
        />
        <datalist id="suggested-customer-tags">
          {SUGGESTED_CUSTOMER_TAGS.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
        <button
          type="submit"
          disabled={isPending}
          className="border border-black/20 px-4 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid hover:border-black hover:text-black disabled:opacity-50"
        >
          Add Tag
        </button>
      </form>
      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_CUSTOMER_TAGS.filter((tag) => !tags.includes(tag)).slice(0, 8).map((tag) => (
          <button
            key={tag}
            type="button"
            disabled={isPending}
            onClick={() => {
              const formData = new FormData();
              formData.set("customerKey", customerKey);
              formData.set("tag", tag);
              startTransition(async () => {
                await adminAddCustomerTagAction(formData);
              });
            }}
            className="border border-black/15 px-3 py-1.5 font-sans text-xs uppercase tracking-nav text-gray-mid hover:border-black hover:text-black"
          >
            + {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
