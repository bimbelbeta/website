import { siteConfig } from "./seo-config";

export interface MetaProps {
	title?: string;
	description?: string;
	image?: string;
	noIndex?: boolean;
	canonical?: string;
}

export interface JsonLdProps {
	"@context": string;
	"@type": string;
	[key: string]: unknown;
}

export function createJsonLd(data: JsonLdProps) {
	return {
		type: "application/ld+json",
		children: JSON.stringify(data),
	};
}

export function createMeta({ title, description, image, noIndex, canonical }: MetaProps = {}) {
	const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
	const metaDescription = description || siteConfig.description;
	const ogImage = image || siteConfig.ogImage;
	const canonicalUrl = canonical || siteConfig.url;

	return [
		{ name: "description", content: metaDescription },
		{ name: "keywords", content: siteConfig.keywords.join(", ") },
		{ name: "author", content: siteConfig.name },

		{ property: "og:title", content: fullTitle },
		{ property: "og:description", content: metaDescription },
		{ property: "og:type", content: siteConfig.type },
		{ property: "og:url", content: canonicalUrl },
		{ property: "og:image", content: ogImage },
		{ property: "og:site_name", content: siteConfig.name },
		{ property: "og:locale", content: siteConfig.locale },

		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: fullTitle },
		{ name: "twitter:description", content: metaDescription },
		{ name: "twitter:image", content: ogImage },
		{ name: "twitter:creator", content: siteConfig.twitterCreator },

		...(canonical ? [{ rel: "canonical", href: canonical }] : []),
		...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
	];
}

export function createOrganizationSchema() {
	return createJsonLd({
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteConfig.name,
		url: siteConfig.url,
		description: siteConfig.description,
		logo: `${siteConfig.url}/logo.svg`,
		sameAs: [],
	});
}

export function createWebSiteSchema() {
	return createJsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteConfig.name,
		url: siteConfig.url,
		description: siteConfig.description,
		potentialAction: {
			"@type": "SearchAction",
			target: `${siteConfig.url}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		},
	});
}

export function createBreadcrumbSchema(items: Array<{ name: string; item: string }>) {
	return createJsonLd({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.item,
		})),
	});
}
