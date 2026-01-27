import React from 'react';

interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'SportsEvent';
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
};

export const WebsiteStructuredData = () => (
  <StructuredData
    type="WebSite"
    data={{
      name: 'MTG Maui League',
      description: "Hawaii's premier Magic: The Gathering tournament platform",
      url: 'https://www.mtg-maui.com',
      publisher: {
        '@type': 'Organization',
        name: 'MTG Maui League',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.mtg-maui.com/images/icons/icon-512x512.svg',
        },
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.mtg-maui.com/leaderboard?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }}
  />
);

export const OrganizationStructuredData = () => (
  <StructuredData
    type="Organization"
    data={{
      name: 'MTG Maui League',
      description: 'Professional Magic: The Gathering tournament organization in Hawaii',
      url: 'https://www.mtg-maui.com',
      logo: 'https://www.mtg-maui.com/images/icons/icon-512x512.svg',
      sameAs: [
        'https://discord.gg/mtgmaui', // Placeholder - would be actual social links
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'admin@mtg-maui.com',
      },
      sportsActivity: {
        '@type': 'SportsActivity',
        name: 'Magic: The Gathering',
        sport: 'Trading Card Game',
      },
    }}
  />
);