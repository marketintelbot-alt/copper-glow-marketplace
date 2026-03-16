"use client";
/* eslint-disable @next/next/no-img-element */

import { UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

export function ProviderPhotoUploader() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="rounded-[28px] border border-dashed border-[color:var(--color-border-strong)] bg-white/75 p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--color-surface-soft)]">
          <UploadCloud className="h-5 w-5 text-[color:var(--color-ink-muted)]" />
        </span>
        <div>
          <p className="font-medium text-[color:var(--color-ink)]">Portfolio upload preview</p>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            In demo mode, files stay local in the browser so the UI can be previewed without storage credentials.
          </p>
        </div>
      </div>
      <label className="mt-5 flex h-40 cursor-pointer items-center justify-center rounded-[24px] bg-[color:var(--color-surface-soft)]">
        {previewUrl ? (
          <img src={previewUrl} alt="Portfolio preview" className="h-full w-full rounded-[24px] object-cover" />
        ) : (
          <span className="text-sm text-[color:var(--color-ink-muted)]">Choose an image to preview upload styling</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
              setPreviewUrl(URL.createObjectURL(file));
            }
          }}
        />
      </label>
    </div>
  );
}
