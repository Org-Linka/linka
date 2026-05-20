import InfoCard from "./InfoCard";
import LinkRow from "./LinkRow";

export default function SocialLinksSection({ links }) {

  return (
    <InfoCard
      title="Redes e Links"
      icon="share-social-outline"
    >

      <LinkRow
        label="LinkedIn"
        icon="logo-linkedin"
        url={links.linkedin}
      />

      <LinkRow
        label="GitHub"
        icon="logo-github"
        url={links.github}
      />

      <LinkRow
        label="Instagram"
        icon="logo-instagram"
        url={links.instagram}
      />

      <LinkRow
        label="Portfólio/Website"
        icon="globe-outline"
        url={links.portfolio}
        isLast
      />

    </InfoCard>
  );
}