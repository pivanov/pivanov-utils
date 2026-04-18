import { defineConfig } from "vitepress";

export default defineConfig({
  title: "@pivanov/utils",
  description: "A focused collection of TypeScript utilities for modern web development.",
  base: "/pivanov-utils/",

  head: [
    [
      "meta",
      {
        name: "keywords",
        content: "typescript, utilities, utils, event bus, cache api, deep clone, deep equal, react",
      },
    ],
  ],

  markdown: {
    theme: {
      light: "one-dark-pro",
      dark: "one-dark-pro",
    },
  },

  themeConfig: {
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "API", link: "/api/assertion" },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/@pivanov/utils",
      },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Why @pivanov/utils", link: "/why" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "Assertion (type guards)", link: "/api/assertion" },
          { text: "Object", link: "/api/object" },
          { text: "Promise", link: "/api/promise" },
          { text: "String", link: "/api/string" },
          { text: "deepClone", link: "/api/deep-clone" },
          { text: "isEqual", link: "/api/is-equal" },
          { text: "DOM", link: "/api/dom" },
          { text: "Cache API", link: "/api/cache-api" },
          { text: "Event Bus", link: "/api/event-bus" },
          { text: "Types", link: "/api/types" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Typed Events", link: "/guides/typed-events" },
          { text: "Async Patterns", link: "/guides/async-patterns" },
          {
            text: "Cache with TTL",
            link: "/guides/cache-ttl",
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/pivanov/pivanov-utils",
      },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "MIT License | Made by Pavel Ivanov",
      copyright: 'Supported by <a href="https://logicstar.ai/">LogicStar AI</a>.',
    },
  },
});
