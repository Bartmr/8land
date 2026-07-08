import React from 'react';
import { PROJECT_SLOGAN } from "../../core/project-details"
import thumbnailSrc from './thumbnail.jpeg'
import { EnvironmentVariables } from "../../core/environment-variables";

const GATSBY_SITE_URL = EnvironmentVariables.SITE_URL

export function HtmlHead(props: {
    location: Location,
    title: string
}) {
    const siteUrl = GATSBY_SITE_URL
    const siteTitle = '8Land'
    const description = PROJECT_SLOGAN
    const title = `${props.title} - ${siteTitle}`;

    const thumbnail = {
        src: thumbnailSrc,
        width: 1200,
        height: 1200,
        extension: "jpeg",
    };
    
    const url = EnvironmentVariables.SITE_URL + props.location.pathname;

    return <>
        <html lang="en" />
        <title>{props.title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />

        <meta property="og:type" content="website" />

        <meta property="og:image" content={`${siteUrl}${thumbnail.src}`} />
        <meta
            property="og:image:secure_url"
            content={`${siteUrl}${thumbnail.src}`}
        />
        <meta
            property="og:image:type"
            content={`image/${thumbnail.extension}`}
        />
        <meta property="og:image:width" content={`${thumbnail.width}`} />
        <meta property="og:image:height" content={`${thumbnail.height}`} />
        <meta property="og:image:alt" content="Website Thumbnail" />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content={siteTitle} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}${thumbnail.src}`} />
    </>
}