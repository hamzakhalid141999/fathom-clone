"use client";

import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Link2,
  Lock,
  Mail,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TeamVisibility = "none" | "other" | "all";
type AccessRole = "limited" | "standard" | "admin";
type LinkAccess = "anyone" | "domain" | "added";

type SharePerson = {
  id: string;
  name: string;
  email: string;
  role: "owner" | AccessRole;
};

const TEAM_OPTIONS: {
  value: TeamVisibility;
  label: string;
  icon: typeof Eye;
}[] = [
    { value: "none", label: "No Team Visibility", icon: EyeOff },
    { value: "other", label: "Visible to Other Only", icon: User },
    { value: "all", label: "Visible to All Teams", icon: Eye },
  ];

const ROLE_OPTIONS: { value: AccessRole; label: string; description: string }[] = [
  {
    value: "limited",
    label: "Limited",
    description: "No access to highlights or comments",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Access to all content. Can add comments, highlights, or action items",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Can share with others, trim meeting, edit the transcript",
  },
];

const LINK_OPTIONS: {
  value: LinkAccess;
  label: string;
  icon: typeof Globe;
}[] = [
    { value: "anyone", label: "Anyone with the link can view", icon: Globe },
    {
      value: "domain",
      label: "Anyone @hamzakhalid141999@gmail.com can view",
      icon: Building2,
    },
    { value: "added", label: "Only people added can view", icon: Lock },
  ];

const OWNER: SharePerson = {
  id: "owner",
  name: "Hamza Khalid",
  email: "hamzakhalid141999@gmail.com",
  role: "owner",
};

const MENU_EASE = [0.22, 1, 0.36, 1] as const;

const menuMotion = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.22, ease: MENU_EASE },
};

const popoverMotion = {
  initial: { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.97 },
  transition: { duration: 0.26, ease: MENU_EASE },
};

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return false;
  const domain = trimmed.slice(at + 1);
  const dot = domain.indexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

export function SharePopover({
  meetingId,
  onCopyLink,
  linkCopied = false,
}: {
  meetingId: string;
  onCopyLink: () => void;
  linkCopied?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<TeamVisibility>("all");
  const [teamRole, setTeamRole] = useState<AccessRole>("standard");
  const [linkAccess, setLinkAccess] = useState<LinkAccess>("anyone");
  const [people, setPeople] = useState<SharePerson[]>([OWNER]);
  const [invitees, setInvitees] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<AccessRole>("standard");
  const [sharing, setSharing] = useState(false);
  const [openMenu, setOpenMenu] = useState<
    "visibility" | "role" | "link" | "invite-role" | null
  >(null);
  const inviting = invitees.length > 0;

  const emailCandidate = query.trim();
  const showAddEmail = looksLikeEmail(emailCandidate);
  const alreadyAdded = people.some(
    (person) => person.email.toLowerCase() === emailCandidate.toLowerCase()
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (sharing) return;
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setOpenMenu(null);
    }

    function onKey(event: KeyboardEvent) {
      if (sharing) return;
      if (event.key === "Escape") {
        setOpenMenu(null);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, sharing]);

  function addEmail(email: string) {
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) return;
    if (
      invitees.some((value) => value.toLowerCase() === trimmed.toLowerCase()) ||
      people.some((person) => person.email.toLowerCase() === trimmed.toLowerCase())
    ) {
      setQuery("");
      setOpenMenu(null);
      return;
    }

    setInvitees((prev) => [...prev, trimmed]);
    setQuery("");
    setOpenMenu(null);
  }

  function removeInvitee(email: string) {
    setInvitees((prev) => prev.filter((value) => value !== email));
  }

  function shareRecording() {
    if (sharing || invitees.length === 0) return;
    const pending = invitees;
    const role = inviteRole;
    setSharing(true);
    setOpenMenu(null);

    window.setTimeout(() => {
      setPeople((prev) => [
        ...prev,
        ...pending
          .filter(
            (email) =>
              !prev.some((person) => person.email.toLowerCase() === email.toLowerCase())
          )
          .map((email) => ({
            id: `invite_${email.toLowerCase()}`,
            name: email,
            email,
            role,
          })),
      ]);
      setInvitees([]);
      setQuery("");
      setInviteRole("standard");
      setSharing(false);
    }, 1000);
  }

  function cancelInvite() {
    setInvitees([]);
    setQuery("");
    setInviteRole("standard");
    setOpenMenu(null);
  }

  function setPersonRole(id: string, role: AccessRole) {
    setPeople((prev) =>
      prev.map((person) => (person.id === id ? { ...person, role } : person))
    );
  }

  function removePerson(id: string) {
    setPeople((prev) => prev.filter((person) => person.id !== id));
  }

  const visibilityLabel =
    TEAM_OPTIONS.find((option) => option.value === visibility)?.label ??
    "Visible to All Teams";
  const VisibilityIcon =
    TEAM_OPTIONS.find((option) => option.value === visibility)?.icon ?? Eye;
  const linkLabel =
    LINK_OPTIONS.find((option) => option.value === linkAccess)?.label ??
    "Anyone with the link can view";
  const teamCount = Math.max(0, people.length - 1);

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center overflow-hidden rounded-full bg-accent text-bg">
        <button
          type="button"
          onClick={() => {
            setOpen((prev) => !prev);
            setOpenMenu(null);
            setInvitees([]);
            setQuery("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition hover:bg-accent-strong"
        >
          <Eye className="h-3.5 w-3.5" />
          Share
        </button>
        <span className="h-5 w-px bg-black/20" />
        <button
          type="button"
          onClick={onCopyLink}
          aria-label={linkCopied ? "Link copied" : "Copy share link"}
          className="px-2.5 py-1.5 transition hover:bg-accent-strong"
        >
          {linkCopied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="share-popover"
            {...popoverMotion}
            className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[420px] origin-top-right rounded-2xl border border-border bg-bg p-5"
          >
            <h2 className="text-lg font-semibold text-text">Share meeting</h2>

            <div className="relative mt-4">
              <div
                className={cn(
                  "flex min-h-9 items-center gap-2 rounded-full border border-border bg-bg-elevated pl-3 pr-2",
                  inviting && "pr-1.5"
                )}
              >
                {inviting ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 py-1">
                    {invitees.map((email) => (
                      <span
                        key={email}
                        className="inline-flex max-w-full items-center gap-1 rounded-full bg-bg-hover px-2 py-0.5 text-xs text-text"
                      >
                        <span className="truncate">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeInvitee(email)}
                          aria-label={`Remove ${email}`}
                          className="rounded-full text-text-faint hover:text-text"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && showAddEmail) {
                          event.preventDefault();
                          addEmail(emailCandidate);
                        }
                      }}
                      placeholder="Add more..."
                      className="min-w-[88px] flex-1 bg-transparent py-1 text-sm text-text placeholder:text-text-faint outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4 shrink-0 text-text-faint" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && showAddEmail) {
                          event.preventDefault();
                          addEmail(emailCandidate);
                        }
                      }}
                      placeholder="Add teams, users, and emails"
                      className="h-9 min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-text-faint outline-none"
                    />
                  </>
                )}

                {inviting ? (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu((prev) =>
                          prev === "invite-role" ? null : "invite-role"
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-text-muted transition hover:bg-bg-hover hover:text-text"
                    >
                      {ROLE_OPTIONS.find((option) => option.value === inviteRole)?.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <AnimatePresence>
                      {openMenu === "invite-role" ? (
                        <motion.div
                          key="invite-role-menu"
                          {...menuMotion}
                          className="absolute right-0 top-[calc(100%+8px)] z-20 w-[280px] origin-top-right rounded-xl bg-bg-elevated py-1.5 border border-border"
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setInviteRole(option.value);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-start gap-3 px-3 py-1 text-left hover:bg-bg-hover"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm text-text">
                                  {option.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-text-muted">
                                  {option.description}
                                </span>
                              </span>
                              {inviteRole === option.value ? (
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                              ) : null}
                            </button>
                          ))}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>

              <AnimatePresence>
                {showAddEmail ? (
                  <motion.button
                    key="add-email"
                    type="button"
                    {...menuMotion}
                    onClick={() => addEmail(emailCandidate)}
                    className="absolute inset-x-0 top-[calc(100%+6px)] z-10 flex flex-col items-center gap-0 rounded-xl border border-border bg-bg-elevated text-left shadow-xl"
                  >
                    <div className="w-full rounded-t-xl bg-bg px-3 py-1 text-white/35">
                      <span className="text-[12px]">Add email</span>
                    </div>
                    <div className="flex w-full gap-1 px-1.5 py-1.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-text-muted">
                        <Mail className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="mb-[-2px] block text-[12px] text-text">
                          {emailCandidate}
                        </span>
                        <span className="block text-[12px] text-text-faint">
                          {alreadyAdded ? "Already added" : "Press Enter to add"}
                        </span>
                      </span>
                    </div>
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>

            {inviting ? (
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelInvite}
                  disabled={sharing}
                  className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition hover:bg-bg-hover hover:text-text disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={shareRecording}
                  disabled={sharing}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-bg transition",
                    sharing
                      ? "cursor-not-allowed bg-[#0d4f73] text-white/55"
                      : "bg-accent hover:bg-accent-strong"
                  )}
                >
                  {sharing ? "Sharing..." : "Share Recording"}
                </button>
              </div>
            ) : (
              <>
            <p className="mt-5 text-sm text-text-muted">Team access</p>
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((prev) => (prev === "visibility" ? null : "visibility"))
                }
                className="inline-flex items-center gap-2 text-sm text-text"
              >
                <VisibilityIcon className="h-4 w-4 text-text-muted" />
                {visibilityLabel}
                <ChevronDown className="h-3.5 w-3.5 text-text-faint" />
              </button>
              <AnimatePresence>
                {openMenu === "visibility" ? (
                  <motion.div
                    key="visibility-menu"
                    {...menuMotion}
                    className="absolute left-0 top-[calc(100%+8px)] z-20 w-[260px] origin-top-left rounded-xl bg-bg-elevated border border-border py-1.5 shadow-2xl"
                  >
                    {TEAM_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setVisibility(option.value);
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-text hover:bg-bg-hover"
                        >
                          <Icon className="h-4 w-4 text-text-muted" />
                          <span className="flex-1 text-[12px]">{option.label}</span>
                          {visibility === option.value ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : null}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <p className="mt-5 text-sm text-text-muted">People with access</p>
            <div className="mt-3 space-y-3">
              {people
                .filter((person) => person.role === "owner")
                .map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-[10px] font-semibold text-text">
                      {initials(person.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{person.name}</p>
                      <p className="truncate text-xs text-text-faint">{person.email}</p>
                    </div>
                    <span className="text-sm text-text-muted">Owner</span>
                  </div>
                ))}

              {visibility !== "none" ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted">
                    <Users className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text">All Teams</p>
                    <p className="text-xs text-text-faint">
                      {teamCount} person{teamCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu((prev) => (prev === "role" ? null : "role"))
                      }
                      className="inline-flex items-center gap-1 text-sm text-text-muted"
                    >
                      {ROLE_OPTIONS.find((option) => option.value === teamRole)?.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <AnimatePresence>
                      {openMenu === "role" ? (
                        <motion.div
                          key="team-role-menu"
                          {...menuMotion}
                          className="absolute right-0 top-[calc(100%+8px)] z-20 w-[280px] origin-top-right rounded-xl bg-bg-elevated py-1.5 border border-border"
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setTeamRole(option.value);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-start gap-3 px-3 py-1 text-left hover:bg-bg-hover"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm text-text">{option.label}</span>
                                <span className="mt-0.5 block text-xs text-text-muted">
                                  {option.description}
                                </span>
                              </span>
                              {teamRole === option.value ? (
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                              ) : null}
                            </button>
                          ))}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibility("none")}
                    aria-label="Remove team access"
                    className="rounded-md p-1 text-text-faint hover:text-text"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}

              {people
                .filter((person) => person.role !== "owner")
                .map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-[10px] font-semibold text-text">
                      {initials(person.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{person.name}</p>
                      <p className="truncate text-xs text-text-faint">{person.email}</p>
                    </div>
                    <RoleMenu
                      value={person.role as AccessRole}
                      onChange={(role) => setPersonRole(person.id, role)}
                    />
                    <button
                      type="button"
                      onClick={() => removePerson(person.id)}
                      aria-label={`Remove ${person.email}`}
                      className="rounded-md p-1 text-text-faint hover:text-text"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((prev) => (prev === "link" ? null : "link"))
                  }
                  className="inline-flex max-w-[240px] items-center gap-2 text-left text-sm text-text"
                >
                  <Globe className="h-4 w-4 shrink-0 text-text-muted" />
                  <span className="truncate">{linkLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-faint" />
                </button>
                <AnimatePresence>
                  {openMenu === "link" ? (
                    <motion.div
                      key="link-menu"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: MENU_EASE }}
                      className="absolute bottom-[calc(100%+8px)] left-0 z-20 w-[320px] origin-bottom-left rounded-xl bg-bg-elevated py-1.5 border border-border"
                    >
                      {LINK_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setLinkAccess(option.value);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-1 text-left text-sm text-text hover:bg-bg-hover"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-text-muted" />
                            <span className="flex-1">{option.label}</span>
                            {linkAccess === option.value ? (
                              <Check className="h-4 w-4 text-accent" />
                            ) : null}
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={onCopyLink}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#2a2a30] px-3 py-1.5 text-sm text-text transition hover:bg-bg-hover"
              >
                <Link2 className="h-3.5 w-3.5" />
                Copy Link
              </button>
            </div>
              </>
            )}
            <p className="sr-only">{meetingId}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function RoleMenu({
  value,
  onChange,
}: {
  value: AccessRole;
  onChange: (role: AccessRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-sm text-text-muted"
      >
        {ROLE_OPTIONS.find((option) => option.value === value)?.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="person-role-menu"
            {...menuMotion}
            className="absolute right-0 top-[calc(100%+8px)] z-20 w-[280px] origin-top-right rounded-xl bg-bg-elevated py-1.5 border border-border"
          >
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-1 text-left hover:bg-bg-hover"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-text">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {option.description}
                  </span>
                </span>
                {value === option.value ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                ) : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
