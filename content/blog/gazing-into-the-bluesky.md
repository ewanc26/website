---
title: "Gazing Into the Bluesky"
summary: "My thoughts on Bluesky after a few days on the platform."
description: "I do really like the platform, but it's got its pitfalls."
date: 2024-04-17T02:14:10+01:00
draft: false
tags: ['Bluesky']
cover:
    image: "/images/bluesky/bluesky-profile.jpeg"
    alt: "My Bluesky account (@ewancroft.uk) as seen through bsky.app"
    caption: "My Bluesky account (@ewancroft.uk) as seen through bsky.app"
    relative: false
---

Bluesky, `bsky`, whatever.

It's an alternative to Twitter (yes, I am still calling it Twitter, not ***X***) and the Fediverse (such as [Mastodon](https://joinmastodon.org)), running atop [the AT Protocal](https://atproto.com/) (also known as 'ATProto').

I decided to test it out a few days ago, with my account being [@ewancroft.uk](https://bsky.app/profile/ewancroft.uk). ***Yes!*** Even domains can be used as the handles, with the default being a subdomain under `bsky.social` (i.e., `ewancroft.bsky.social`) however ATProto has a nice trick where if you add a [/.well-known/ file](https://en.wikipedia.org/wiki/Well-known_URI) called `atproto-did` and add the identifier (which you can find under `Settings > Change Handle`) on your website, you can have the domain as the handle!

## My Thoughts

Bluesky has a pretty similar feel to Twitter (in particular - *early* Twitter c. 2008-2013) and a similar UI. It's not much of a surprise when co-founder of Twitter, Jack Dorsey, is on Bluesky's board of directors. He initially announced Bluesky as an initiative while CEO of Twitter in 2019[^1] and continued on with it as a board member when it was incorporated as a separate [benefit corporation](https://en.wikipedia.org/wiki/Benefit_corporation) from Twitter in late 2021[^1]

Anyway, enough of reading off of Wikipedia. Let me talk about what I think.

### User Interface

![The 'Following' feed of the default web interface, on bsky.app](/images/bluesky/bluesky-ui.jpeg)

I quite like the UI, it's familiar for those coming from Twitter and has the familiar layout as such. No real complaints.

### My Annoyances

#### It feels... sort of lonely?

There is an ever-present feeling of loneliness for me while I'm browsing Bluesky. Maybe I should use [Graysky?](https://graysky.app/)

I personally have trouble finding people on the platform, despite there being a 'Discover' feed, and this gives me a disconnect. I think this is the rose-tinted glasses but I feel like Mastodon's 'Explore' page is better because it shows posts, people and hashtags. Bluesky's equivalent feels off... I don't know why.

#### Lack of Markdown

I know I'm spoiled for [Markdown formatting](https://en.wikipedia.org/wiki/Markdown), with [this website's content being written in Markdown](https://github.com/ewanc26/website/tree/main/content) and [Mastodon Glitch Edition](https://glitch-soc.github.io/docs/) (a Mastodon [fork](https://en.wikipedia.org/wiki/Fork_(software_development))) using it too, but I don't know why even the most basic Markdown syntax is ignored, such as

1. `*italics*`

2. `**bold**`

3. `~~strikethrough~~`

when they are very helpful!

#### 300 character limit

Short and sweet... not.

I'm definitely spoiled because Mastodon by default supplies 500 characters to play with per post, and [infosec.exchange](https://infosec.exchange), my Mastodon server, supplies me with an overly generous 11000 characters.

#### No Direct Messaging Support

One glaring omission in Bluesky's feature set is the lack of direct messaging (DM) support. DMs are a crucial aspect of social media platforms, so why leave them out?

#### Lack of Post Editing Functionality

Another notable absence is the inability to edit posts after they've been published. This lack of editing is annoying for me because I sometimes make mistakes and being able to edit them is a godsend.

## Conclusion

In conclusion, my initial exploration of Bluesky has revealed both promising aspects and areas for improvement. The platform's familiar interface, and its community reminiscent of early Twitter, offer a comfortable experience for users transitioning from other social media platforms. The integration of the AT Protocol allows for unique handle customisation, showcasing Bluesky's flexibility and potential for personalisation.

[^1]: [Bluesky company history (Wikipedia)](https://en.wikipedia.org/wiki/Bluesky_(social_network)#Company_history)
