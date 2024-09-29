---
aliases:
- /blog/mastodon-markov-chains/
date: 2024-03-03 14:24:14+00:00
description: Gibberish is my hobby.
draft: false
showToC: true
summary: A little blog post talking about Markov chains.
tags:
- Fediverse
- Programming
- Python
title: Mastodon Markov Chains, and Why I Created My Own
---

[Markov chains](https://en.wikipedia.org/wiki/Markov_chain) are interesting, aren't they?

It's a way to create a relatively simple algorithm with *maths*, and I did that!

As you would see from the bot, it takes my posts and spits out new randomised posts, which usually is gibberish.

## Why did I create one?

I created my bot as I had seen other Markov chain generative bots such as [@chain@brain.d.on-t.work](https://brain.d.on-t.work/@chain) (which is built from [@kopper@brain.d.on-t.work](https://brain.d.on-t.work/@kopper)'s posts). It sparked interest in the gibberish that it could generate, but I wanted to keep it updated, so *I did it myself!*

### Open source?

I also made it open-source with the [MIT Licence](https://opensource.org/license/mit) so that other people could use my shoddy code *(If it works, don't touch it!)* and build on it.

I'm honestly just glad I was able to use Python again. It was fun to code!

## How Does the Script work?

Here is a brief explanation of how [the Mastodon Markov chain bot](https://github.com/ewanc26/mastodon-markov) works. If you'd like to learn how Markov chains work, I recommend watching [this video by Harvard](https://www.youtube.com/watch?v=JHwyHIz6a8A).

### Initialisation and Setup

The script begins by importing necessary libraries like `dotenv` for managing environment variables, `MarkovText` from `markovchain.text` for Markov chain functionality, and `Mastodon` for interaction with the Mastodon API through [Mastodon.py](https://github.com/halcy/Mastodon.py/). Additionally, it imports modules for handling HTML content and regular expressions.

### Environment Configuration

It loads environment variables from a `.env` file using `dotenv.load_dotenv()`. These variables include Mastodon base URL, access tokens, and other configuration details necessary for API authentication.

### Cleaning Content

A function called `clean_content()` is defined to sanitise HTML content fetched from Mastodon posts. It removes HTML tags, decodes HTML entities, eliminates usernames, and filters out special characters, ensuring clean input for the Markov chain.

### Fetching Mastodon Posts

Another function, `get_account_posts()`, retrieves recent posts from the specified Mastodon account. It cleans the content using the previously defined function and returns a list of sanitized posts.

### Generating and Posting

The script defines `generate_and_post_example()` to generate Markov chain text and post it to a destination Mastodon account. It ensures the generated text meets character limits and handles posting errors gracefully.

### Dataset Refresh

To keep the Markov dataset up to date, there's a `refresh_dataset()` function. It fetches recent posts from the source Mastodon account, cleans them, and adds them to the Markov chain dataset.

### Main Loop

The main loop orchestrates the entire process. It calculates a random refresh interval between 5 to 10 minutes and schedules the next refresh accordingly. During each iteration, it refreshes the dataset, generates and posts an example, then waits until the next refresh interval before repeating the process.

### User Interaction

The script interacts with the user when necessary, prompting for Mastodon and environment variable details if they're not already configured. It also monitors for the `ctrl+C` hotkey as a way for the script to be stopped immediately.

## Conclusion

Working on this project reignited my love for coding in Python. The process involved in setting up the Mastodon Markov chain bot, from importing necessary libraries to cleaning content and orchestrating dataset refreshes, has been both educational and rewarding. Moreover, the interaction with users, prompt handling, and error management added a layer of complexity that enhanced the overall coding experience.