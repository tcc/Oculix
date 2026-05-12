// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://oculix.org',
  integrations: [
    starlight({
      title: 'OculiX',
      logo: {
        src: './src/assets/oculix-logo.png',
        alt: 'OculiX gecko logo',
        replacesTitle: false,
      },
      favicon: '/favicon.ico',
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        fr: { label: 'Français', lang: 'fr' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oculix-org/Oculix' },
      ],
      editLink: {
        baseUrl: 'https://github.com/oculix-org/Oculix/edit/master/oculix-site/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          translations: { fr: 'Démarrage' },
          items: [
            { slug: 'getting-started/installation' },
            { slug: 'getting-started/first-script' },
            { slug: 'getting-started/ide-tour' },
          ],
        },
        {
          label: 'Guides',
          translations: { fr: 'Guides' },
          items: [
            { slug: 'guides/visual-matching' },
            { slug: 'guides/ocr' },
            { slug: 'guides/vision-pipeline' },
            { slug: 'guides/jython' },
          ],
        },
        {
          label: 'Reference',
          translations: { fr: 'Référence' },
          items: [
            { slug: 'reference/api' },
            { slug: 'reference/cli' },
            { slug: 'reference/migration' },
          ],
        },
        {
          label: 'Community',
          translations: { fr: 'Communauté' },
          items: [
            { slug: 'community/contributing' },
            { slug: 'community/sponsors' },
            { slug: 'community/translators' },
          ],
        },
        {
          label: 'Support',
          translations: { fr: 'Support' },
          items: [
            { slug: 'support/enterprise' },
          ],
        },
      ],
    }),
  ],
});
