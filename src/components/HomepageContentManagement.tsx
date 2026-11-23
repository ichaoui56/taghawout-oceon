"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  type AboutOceanSettings,
  type HomepageSectionsSettings,
  type LocalizedText,
  type OceanLogSettings,
  type TeamSectionSettings,
} from "../homepage-sections";
import { saveHomepageSectionsSettings } from "../server/homepage-sections-actions";
import DashboardActionToast from "./DashboardActionToast";

const MAX_TEAM_MEMBERS = 12;

async function compressImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 15 * 1024 * 1024) throw new Error("Choose an image smaller than 15 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const fit = Math.min(1, 1500 / Math.max(image.naturalWidth, image.naturalHeight));
    for (const scale of [1, 0.8, 0.65, 0.5, 0.4]) {
      const width = Math.max(1, Math.round(image.naturalWidth * fit * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * fit * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the image.");
      context.drawImage(image, 0, 0, width, height);
      for (const quality of [0.84, 0.72, 0.6, 0.48, 0.36]) {
        const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
        if (compressed?.type === "image/webp" && compressed.size <= 100_000) return compressed;
      }
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  throw new Error("This image could not be reduced below 100 KB. Try a smaller or simpler image.");
}

async function uploadImage(file: File) {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed, "homepage-content.webp");
  const response = await fetch("/api/files", { method: "POST", body: formData, credentials: "same-origin" });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
      ? result.error
      : "Image upload failed. Please try again.";
    throw new Error(message);
  }
  if (typeof result !== "string" || !/^https:\/\//i.test(result)) throw new Error("Image storage returned an invalid URL.");
  return result;
}

function LocalizedFields({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: LocalizedText;
  onChange: (locale: "en" | "fr", value: string) => void;
  multiline?: boolean;
  maxLength: number;
}) {
  return (
    <div className="dashboard-homepage-content__localized">
      <p>{label}</p>
      <div className="dashboard-seo-grid">
        {(["en", "fr"] as const).map((locale) => (
          <label key={locale}>{locale === "en" ? "English" : "French"}
            {multiline ? (
              <textarea value={value[locale]} onChange={(event) => onChange(locale, event.target.value)} maxLength={maxLength} rows={3} required />
            ) : (
              <input value={value[locale]} onChange={(event) => onChange(locale, event.target.value)} maxLength={maxLength} required />
            )}
            <small>{value[locale].length}/{maxLength}</small>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function HomepageContentManagement({ initialSettings }: { initialSettings: HomepageSectionsSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(() => structuredClone(initialSettings));
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function updateAboutHero<K extends keyof Pick<AboutOceanSettings["hero"], "eyebrow" | "titleLead" | "titleAccent" | "introduction" | "discoverStory" | "signature">>(
    key: K,
    locale: "en" | "fr",
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      about: { ...current.about, hero: { ...current.about.hero, [key]: { ...current.about.hero[key], [locale]: value } } },
    }));
  }

  function updateImpact(key: "eyebrow" | "description" | "cta", locale: "en" | "fr", value: string) {
    setSettings((current) => ({
      ...current,
      about: { ...current.about, impact: { ...current.about.impact, [key]: { ...current.about.impact[key], [locale]: value } } },
    }));
  }

  function updateImpactTitle(index: number, locale: "en" | "fr", value: string) {
    setSettings((current) => ({
      ...current,
      about: {
        ...current.about,
        impact: { ...current.about.impact, title: current.about.impact.title.map((line, lineIndex) => lineIndex === index ? { ...line, [locale]: value } : line) },
      },
    }));
  }

  function updateHighlight(index: number, key: "title" | "detail", locale: "en" | "fr", value: string) {
    setSettings((current) => ({
      ...current,
      about: {
        ...current.about,
        impact: {
          ...current.about.impact,
          highlights: current.about.impact.highlights.map((item, itemIndex) => itemIndex === index
            ? { ...item, [key]: { ...item[key], [locale]: value } }
            : item),
        },
      },
    }));
  }

  function updateHeroImage(index: number, updates: Partial<HomepageSectionsSettings["about"]["hero"]["images"][number]>) {
    setSettings((current) => ({
      ...current,
      about: {
        ...current.about,
        hero: { ...current.about.hero, images: current.about.hero.images.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item) },
      },
    }));
  }

  function updateTeam<K extends keyof Pick<TeamSectionSettings, "localCrew" | "eyebrow" | "titleLead" | "titleAccent" | "summary" | "outroLabel" | "outro">>(
    key: K,
    locale: "en" | "fr",
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      team: { ...current.team, [key]: { ...current.team[key], [locale]: value } },
    }));
  }

  function updateTeamMember(index: number, updates: Partial<HomepageSectionsSettings["team"]["members"][number]>) {
    setSettings((current) => ({
      ...current,
      team: { ...current.team, members: current.team.members.map((member, itemIndex) => itemIndex === index ? { ...member, ...updates } : member) },
    }));
  }

  function updateTeamMemberText(index: number, key: "role" | "detail" | "imageAlt", locale: "en" | "fr", value: string) {
    const member = settings.team.members[index];
    updateTeamMember(index, { [key]: { ...member[key], [locale]: value } });
  }

  function updateOceanLog<K extends keyof OceanLogSettings>(key: K, locale: "en" | "fr", value: string) {
    setSettings((current) => ({
      ...current,
      oceanLog: { ...current.oceanLog, [key]: { ...current.oceanLog[key], [locale]: value } },
    }));
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, key: string, onUploaded: (image: string) => void) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setUploadingImage(key);
    setUploadNotice("");
    setSaveToast(null);
    try {
      onUploaded(await uploadImage(file));
      setUploadNotice("Image uploaded. Save to publish the change.");
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingImage(null);
    }
  }

  function addTeamMember() {
    setSettings((current) => ({
      ...current,
      team: {
        ...current.team,
        members: [...current.team.members, {
          id: `team-${crypto.randomUUID()}`,
          name: "",
          role: { en: "", fr: "" },
          detail: { en: "", fr: "" },
          image: "",
          imageAlt: { en: "", fr: "" },
        }],
      },
    }));
  }

  function moveTeamMember(index: number, direction: -1 | 1) {
    setSettings((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.team.members.length) return current;
      const members = [...current.team.members];
      [members[index], members[nextIndex]] = [members[nextIndex], members[index]];
      return { ...current, team: { ...current.team, members } };
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploadingImage !== null) return;
    setSaving(true);
    setSaveToast(null);
    try {
      await saveHomepageSectionsSettings(settings);
      setSaveToast({ type: "success", text: "Homepage content saved and published." });
      router.refresh();
    } catch (error) {
      setSaveToast({ type: "error", text: error instanceof Error ? error.message : "Could not save homepage content." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-seo dashboard-homepage-content" aria-labelledby="homepage-content-title">
      <header className="dashboard-seo__heading">
        <div>
          <p className="transfer-eyebrow">Homepage · About and people</p>
          <h2 id="homepage-content-title">Homepage content</h2>
          <p>Update About Ocean, the community impact block, team profiles, and Ocean Log introduction. Blog articles stay in Blog / Content.</p>
        </div>
        <a className="transfer-add-button" href="/#about-ocean" target="_blank" rel="noreferrer">View homepage <span aria-hidden="true">↗</span></a>
      </header>

      {uploadNotice && <p className="transfer-notice" role="status">{uploadNotice}</p>}
      {saveToast && <DashboardActionToast type={saveToast.type} message={saveToast.text} onDismiss={() => setSaveToast(null)} />}

      <form className="dashboard-seo__form" onSubmit={submit}>
        <fieldset className="dashboard-seo-panel">
          <legend><span>01</span> About Ocean</legend>
          <div className="dashboard-homepage-content__stack">
            <LocalizedFields label="Eyebrow" value={settings.about.hero.eyebrow} onChange={(locale, value) => updateAboutHero("eyebrow", locale, value)} maxLength={120} />
            <div className="dashboard-seo-grid">
              <LocalizedFields label="Title · first line" value={settings.about.hero.titleLead} onChange={(locale, value) => updateAboutHero("titleLead", locale, value)} maxLength={180} />
              <LocalizedFields label="Title · emphasized line" value={settings.about.hero.titleAccent} onChange={(locale, value) => updateAboutHero("titleAccent", locale, value)} maxLength={180} />
            </div>
            <LocalizedFields label="Description" value={settings.about.hero.introduction} onChange={(locale, value) => updateAboutHero("introduction", locale, value)} multiline maxLength={1200} />
            <div className="dashboard-seo-grid">
              <LocalizedFields label="Button label" value={settings.about.hero.discoverStory} onChange={(locale, value) => updateAboutHero("discoverStory", locale, value)} maxLength={120} />
              <LocalizedFields label="Signature line" value={settings.about.hero.signature} onChange={(locale, value) => updateAboutHero("signature", locale, value)} maxLength={180} />
            </div>
            <div className="dashboard-homepage-content__image-grid">
              {settings.about.hero.images.map((item, index) => {
                const uploadKey = `about-hero-${index}`;
                return (
                  <article className="dashboard-homepage-content__image-card" key={uploadKey}>
                    <div className="dashboard-homepage-content__preview">{item.image && <img src={item.image} alt="" />}</div>
                    <strong>Introduction image {index + 1}</strong>
                    <label className="dashboard-homepage-content__url">Image URL<input value={item.image} onChange={(event) => updateHeroImage(index, { image: event.target.value })} maxLength={1200} required /></label>
                    <label className="dashboard-seo-upload">{uploadingImage === uploadKey ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event, uploadKey, (image) => updateHeroImage(index, { image }))} disabled={uploadingImage !== null} /></label>
                    <LocalizedFields label="Image description" value={item.alt} onChange={(locale, value) => updateHeroImage(index, { alt: { ...item.alt, [locale]: value } })} maxLength={180} />
                  </article>
                );
              })}
            </div>
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>02</span> Community and impact</legend>
          <div className="dashboard-homepage-content__stack">
            <LocalizedFields label="Eyebrow" value={settings.about.impact.eyebrow} onChange={(locale, value) => updateImpact("eyebrow", locale, value)} maxLength={120} />
            <div className="dashboard-seo-grid">
              {settings.about.impact.title.map((line, index) => (
                <LocalizedFields key={`impact-title-${index}`} label={`Title · line ${index + 1}`} value={line} onChange={(locale, value) => updateImpactTitle(index, locale, value)} maxLength={180} />
              ))}
            </div>
            <LocalizedFields label="Description" value={settings.about.impact.description} onChange={(locale, value) => updateImpact("description", locale, value)} multiline maxLength={1000} />
            <LocalizedFields label="Button label" value={settings.about.impact.cta} onChange={(locale, value) => updateImpact("cta", locale, value)} maxLength={120} />
            <div className="dashboard-homepage-content__single-image">
              <div className="dashboard-homepage-content__preview">{settings.about.impact.image && <img src={settings.about.impact.image} alt="" />}</div>
              <div className="dashboard-homepage-content__image-controls">
                <label className="dashboard-homepage-content__url">Community background image<input value={settings.about.impact.image} onChange={(event) => setSettings((current) => ({ ...current, about: { ...current.about, impact: { ...current.about.impact, image: event.target.value } } }))} maxLength={1200} required /></label>
                <label className="dashboard-seo-upload">{uploadingImage === "impact-image" ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event, "impact-image", (image) => setSettings((current) => ({ ...current, about: { ...current.about, impact: { ...current.about.impact, image } } })))} disabled={uploadingImage !== null} /></label>
              </div>
            </div>
            <div className="dashboard-seo-grid">
              {settings.about.impact.highlights.map((item, index) => (
                <fieldset className="dashboard-homepage-content__highlight" key={`impact-${index}`}>
                  <legend>Highlight {index + 1}</legend>
                  <LocalizedFields label="Title" value={item.title} onChange={(locale, value) => updateHighlight(index, "title", locale, value)} maxLength={120} />
                  <LocalizedFields label="Description" value={item.detail} onChange={(locale, value) => updateHighlight(index, "detail", locale, value)} maxLength={200} />
                </fieldset>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>03</span> Ocean Log · Homepage introduction</legend>
          <div className="dashboard-homepage-content__stack">
            <LocalizedFields label="Eyebrow" value={settings.oceanLog.eyebrow} onChange={(locale, value) => updateOceanLog("eyebrow", locale, value)} maxLength={120} />
            <div className="dashboard-seo-grid">
              <LocalizedFields label="Title · first line" value={settings.oceanLog.titleLead} onChange={(locale, value) => updateOceanLog("titleLead", locale, value)} maxLength={120} />
              <LocalizedFields label="Title · second line connector" value={settings.oceanLog.titleBridge} onChange={(locale, value) => updateOceanLog("titleBridge", locale, value)} maxLength={120} />
              <LocalizedFields label="Title · emphasized word" value={settings.oceanLog.titleAccent} onChange={(locale, value) => updateOceanLog("titleAccent", locale, value)} maxLength={120} />
            </div>
            <LocalizedFields label="Description" value={settings.oceanLog.description} onChange={(locale, value) => updateOceanLog("description", locale, value)} multiline maxLength={1000} />
            <div className="dashboard-seo-grid">
              <LocalizedFields label="Button label" value={settings.oceanLog.button} onChange={(locale, value) => updateOceanLog("button", locale, value)} maxLength={120} />
              <LocalizedFields label="Signature line" value={settings.oceanLog.signature} onChange={(locale, value) => updateOceanLog("signature", locale, value)} maxLength={180} />
            </div>
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>04</span> Team members</legend>
          <div className="dashboard-homepage-content__stack">
            <LocalizedFields label="Section eyebrow" value={settings.team.eyebrow} onChange={(locale, value) => updateTeam("eyebrow", locale, value)} maxLength={120} />
            <div className="dashboard-seo-grid">
              <LocalizedFields label="Title · first line" value={settings.team.titleLead} onChange={(locale, value) => updateTeam("titleLead", locale, value)} maxLength={120} />
              <LocalizedFields label="Title · emphasized line" value={settings.team.titleAccent} onChange={(locale, value) => updateTeam("titleAccent", locale, value)} maxLength={120} />
            </div>
            <LocalizedFields label="Section description" value={settings.team.summary} onChange={(locale, value) => updateTeam("summary", locale, value)} multiline maxLength={600} />
            <LocalizedFields label="Local crew label" value={settings.team.localCrew} onChange={(locale, value) => updateTeam("localCrew", locale, value)} maxLength={120} />
            <div className="dashboard-homepage-content__team-heading">
              <p>{settings.team.members.length} of {MAX_TEAM_MEMBERS} team members</p>
              <button type="button" className="transfer-add-button" onClick={addTeamMember} disabled={settings.team.members.length >= MAX_TEAM_MEMBERS}><span aria-hidden="true">＋</span> Add team member</button>
            </div>
            {settings.team.members.map((member, index) => {
              const uploadKey = `team-${member.id}`;
              return (
                <article className="dashboard-homepage-content__member" key={member.id}>
                  <div className="dashboard-homepage-content__preview dashboard-homepage-content__preview--portrait">{member.image && <img src={member.image} alt="" />}</div>
                  <div className="dashboard-homepage-content__member-fields">
                    <div className="dashboard-seo-grid">
                      <label>Full name<input value={member.name} onChange={(event) => updateTeamMember(index, { name: event.target.value })} maxLength={100} required /></label>
                      <label>Image URL<input value={member.image} onChange={(event) => updateTeamMember(index, { image: event.target.value })} maxLength={1200} required /></label>
                    </div>
                    <LocalizedFields label="Role" value={member.role} onChange={(locale, value) => updateTeamMemberText(index, "role", locale, value)} maxLength={120} />
                    <LocalizedFields label="What they do" value={member.detail} onChange={(locale, value) => updateTeamMemberText(index, "detail", locale, value)} multiline maxLength={360} />
                    <LocalizedFields label="Image description" value={member.imageAlt} onChange={(locale, value) => updateTeamMemberText(index, "imageAlt", locale, value)} maxLength={180} />
                    <label className="dashboard-seo-upload">{uploadingImage === uploadKey ? "Uploading…" : "Upload portrait"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event, uploadKey, (image) => updateTeamMember(index, { image }))} disabled={uploadingImage !== null} /></label>
                  </div>
                  <div className="dashboard-homepage-content__member-actions" aria-label={`Team member ${index + 1} controls`}>
                    <button type="button" aria-label={`Move team member ${index + 1} up`} onClick={() => moveTeamMember(index, -1)} disabled={index === 0 || saving || uploadingImage !== null}>↑</button>
                    <button type="button" aria-label={`Move team member ${index + 1} down`} onClick={() => moveTeamMember(index, 1)} disabled={index === settings.team.members.length - 1 || saving || uploadingImage !== null}>↓</button>
                    <button type="button" className="is-danger" aria-label={`Remove team member ${index + 1}`} onClick={() => setSettings((current) => ({ ...current, team: { ...current.team, members: current.team.members.filter((item) => item.id !== member.id) } }))} disabled={saving || uploadingImage === uploadKey}>×</button>
                  </div>
                </article>
              );
            })}
            <div className="dashboard-seo-grid">
              <LocalizedFields label="Closing section label" value={settings.team.outroLabel} onChange={(locale, value) => updateTeam("outroLabel", locale, value)} maxLength={120} />
              <LocalizedFields label="Closing line" value={settings.team.outro} onChange={(locale, value) => updateTeam("outro", locale, value)} maxLength={200} />
            </div>
          </div>
        </fieldset>

        <footer className="dashboard-seo__actions">
          <p>Changes publish to the homepage in English and French. Journal articles are managed separately.</p>
          <button type="submit" disabled={saving || uploadingImage !== null}>{saving ? "Publishing…" : "Save homepage content"}<span aria-hidden="true">→</span></button>
        </footer>
      </form>
    </section>
  );
}