import type { ProfileLinks } from "../profile.types";
import { InfoCard } from "./InfoCard";
import { LinkRow } from "./LinkRow";

type SocialLinksProps = {
  links: Partial<ProfileLinks>;
  onEdit?: () => void;
  showGithub?: boolean;
};

export function SocialLinks({
  links,
  onEdit,
  showGithub = true,
}: SocialLinksProps) {
  return (
    <InfoCard
      title="Redes e Links"
      icon="share-social-outline"
      onEdit={onEdit}
    >
      <LinkRow label="LinkedIn" icon="logo-linkedin" url={links.linkedin ?? ""} />

      {showGithub ? (
        <LinkRow label="GitHub" icon="logo-github" url={links.github ?? ""} />
      ) : null}

      <LinkRow
        label="Instagram"
        icon="logo-instagram"
        url={links.instagram ?? ""}
      />

      <LinkRow
        label="Portfólio/Website"
        icon="globe-outline"
        url={links.portfolio ?? ""}
        isLast
      />
    </InfoCard>
  );
}
