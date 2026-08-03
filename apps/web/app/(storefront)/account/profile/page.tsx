"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccountProfilePage() {
  const [name, setName] = useState("Ayesha Khan");
  const [email] = useState("ayesha@example.com");
  const [phone, setPhone] = useState("0300-1234567");
  const [address, setAddress] = useState("House 12, Block C, Gulberg III");
  const [city, setCity] = useState("Lahore");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary mb-2">
        My Profile
      </h1>
      <p className="text-text-secondary text-[length:var(--text-sm)] mb-8">
        Manage your account details and default shipping address.
      </p>

      {saved && (
        <div className="mb-6 rounded-[var(--radius-sm)] bg-success/10 border border-success/30 px-4 py-3 text-[length:var(--text-sm)] text-success">
          ✓ Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Info Card */}
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] text-text-primary">
              Personal Information
            </h2>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[length:var(--text-sm)] font-medium text-accent-dark hover:underline underline-offset-2"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[length:var(--text-xs)] font-medium text-text-secondary mb-1">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                />
              ) : (
                <p className="text-[length:var(--text-sm)] text-text-primary py-2.5">{name}</p>
              )}
            </div>
            <div>
              <label className="block text-[length:var(--text-xs)] font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <p className="text-[length:var(--text-sm)] text-text-secondary py-2.5">{email}</p>
              <p className="text-[length:var(--text-xs)] text-text-secondary">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-[length:var(--text-xs)] font-medium text-text-secondary mb-1">
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                />
              ) : (
                <p className="text-[length:var(--text-sm)] text-text-primary py-2.5">{phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] space-y-5">
          <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] text-text-primary">
            Default Shipping Address
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[length:var(--text-xs)] font-medium text-text-secondary mb-1">
                Street Address
              </label>
              {editing ? (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                />
              ) : (
                <p className="text-[length:var(--text-sm)] text-text-primary py-2.5">{address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[length:var(--text-xs)] font-medium text-text-secondary mb-1">
                  City
                </label>
                {editing ? (
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                ) : (
                  <p className="text-[length:var(--text-sm)] text-text-primary py-2.5">{city}</p>
                )}
              </div>
              <div>
                <label className="block text-[length:var(--text-xs)] font-medium text-text-secondary mb-1">
                  Country
                </label>
                <p className="text-[length:var(--text-sm)] text-text-secondary py-2.5">Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save / Cancel buttons */}
        {editing && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-[var(--radius-md)] border border-border px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-text-secondary transition hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-[var(--radius-md)] bg-accent px-6 py-2.5 text-[length:var(--text-sm)] font-medium text-text-inverse transition hover:bg-accent-dark"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>

      {/* Quick Links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/orders"
          className="rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
        >
          <span className="text-xl mb-2 block">📦</span>
          <p className="font-medium text-[length:var(--text-sm)] text-text-primary">My Orders</p>
          <p className="text-[length:var(--text-xs)] text-text-secondary">Track status, view history</p>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
        >
          <span className="text-xl mb-2 block">♡</span>
          <p className="font-medium text-[length:var(--text-sm)] text-text-primary">Wishlist</p>
          <p className="text-[length:var(--text-xs)] text-text-secondary">Saved products for later</p>
        </Link>
      </div>
    </main>
  );
}
