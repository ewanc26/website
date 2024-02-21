---
title: "Ditching Windows: My Time Using macOS and Pop!_OS"
summary: "I discuss myself venturing into Pop!_OS Linux on my laptop, replacing Windows."
description: "Sadly, I still have to use Windows at college."
date: 2024-02-18T01:45:25Z
draft: false
tags: ['Linux']
showToc: true
---

I *finally* did it. I ditched Windows completely in my personal life, and as a bonus, gave life back to my laptop.

I had refused to use it since I got my Mac mini back in August as it used Windows, but never felt comfortable enough to install a [Linux distro](https://en.wikipedia.org/wiki/Linux_distribution) on it due to me ***literally corrupting the BIOS, one time, in the process***. That was until I gave [System76's Pop!_OS](https://pop.system76.com/) a chance alongside macOS, which I have been using since August of last year.

## My Reasons to Ditch Windows

It's definitely not for everyone to jump to another operating system. It can be hard and confusing! Sometimes, change is worse than the same, but for me, that was not the case.

I had 3 main pain points, using Windows my whole life, which was:

1. Clutter. The operating system just felt overly full of crap and bloatware. Who even *needs* TikTok on their PC?

2. Advertising. Windows is stuffed full of advertising in its most recent iterations. Just... Why?

3. Boredom. Windows has become quite boring to me, feeling stale and old. I needed a change.

## macOS and my Experience with it

My reasoning for going for a Mac was, quite frankly, impulsive. I had grown up with Apple devices, from an iPod Touch 4th Gen to an iPad Air 2nd Gen, so a Mac didn't seem like a bad choice. I had since been gifted a hand-me-down iPhone 8 Plus from my mum when she upgraded her phone and bought myself an Apple Watch SE 1st Gen, so why not buy a Mac? I went for a Mac mini (M2; 256GB SSD with 16GB RAM) and I've been happy with it.

It's helped me get used to the [Unix-like](https://en.wikipedia.org/wiki/Unix-like) terminal, which is handy for Linux distributions like Pop!_OS as [the Linux kernel](https://en.wikipedia.org/wiki/Linux_kernel) (the core of the Linux operating system) is Unix-like and macOS's kernel, [Darwin](https://en.wikipedia.org/wiki/Darwin_(operating_system)), is Unix-based.

### Specifications of My Mac

These are the specs as described by [neofetch](https://en.wikipedia.org/wiki/Neofetch):

```plaintext
                    'c.          ewan@Mac-Mini 
                 ,xNMM.          ------------- 
               .OMMMMo           OS: macOS 14.3.1 23D60 arm64 
               OMMM0,            Host: Mac14,3 
     .;loddo:' loolloddol;.      Kernel: 23.3.0 
   cKMMMMMMMMMMNWMMMMMMMMMM0:    Uptime: 8 hours, 21 mins 
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.    Packages: 96 (brew) 
 XMMMMMMMMMMMMMMMMMMMMMMMX.      Shell: zsh 5.9 
;MMMMMMMMMMMMMMMMMMMMMMMM:       Resolution: 1920x1080 
:MMMMMMMMMMMMMMMMMMMMMMMM:       DE: Aqua 
.MMMMMMMMMMMMMMMMMMMMMMMMX.      WM: Rectangle 
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.    Terminal: Apple_Terminal 
 .XMMMMMMMMMMMMMMMMMMMMMMMMMMk   Terminal Font: AndaleMono 
  .XMMMMMMMMMMMMMMMMMMMMMMMMK.   CPU: Apple M2 
    kMMMMMMMMMMMMMMMMMMMMMMd     GPU: Apple M2 
     ;KMMMMMMMWXXWMMMMMMMk.      Memory: 2081MiB / 16384MiB 
       .cooc,.    .,coo:.
```

### Why Not Use Asahi Linux?

[Asahi Linux](https://asahilinux.org/about/) is a specific project for [Apple Silicon](https://en.wikipedia.org/wiki/Apple_silicon) Macs, with the "flagship" distro being [Fedora Asahi Remix](https://asahilinux.org/fedora/) in colaboration with [The Fedora Project](https://fedoraproject.org/).

I chose not to replace macOS on my Mac mini since I knew I might not like it, and I didn't want to potentially make my £850 main PC unusable as I bought it myself as a 18th birthday present.

## Pop!_OS

This was a secondary choice, originally. I had installed [Canonical's Ubuntu](https://ubuntu.com/) on many a machine before, and was quite familliar with the [GNOME Desktop Environmet](https://en.wikipedia.org/wiki/GNOME) (having used it on and off since 2020 or so), so it was a no-brainer. That was until I found [a troubling history](https://arstechnica.com/information-technology/2012/12/richard-stallman-calls-ubuntu-spyware-because-it-tracks-searches/).

I did still like the codebase, so I decided to stick with Pop!_OS, which is based on Ubuntu.

### First Impressions

![My Pop!_OS desktop showing neofetch in the terminal](/images/linux/Pop!_OS-desktop.png 'My Pop!_OS desktop showing neofetch in the terminal')

Now, I can only speak on first impressions, but it is easy for me to use. I have had some experience with Ubuntu, which Pop!_OS is based on, so the terminal commands and everything were similar. It was easy for me to swap the shells (the terminal environments) from [bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)) to [zsh](https://en.wikipedia.org/wiki/Z_shell) being a few Google searches away, as I use zsh as my shell on macOS, so that was nice.

It is a little annoying that my iCloud stuff can't be synced over, but it's not that big of a deal since this laptop is a secondary machine.

If you're interested and have no experience, I recommend [this video by Linus Tech Tips](https://www.youtube.com/watch?v=_Ua-d9OeUOg) on getting started with Pop!_OS.

### Specifications of My Laptop

These are the specs as described by neofetch:

```plaintext
             /////////////                ewan@pop-os-laptop 
         /////////////////////            ------------------ 
      ///////*767////////////////         OS: Pop!_OS 22.04 LTS x86_64 
    //////7676767676*//////////////       Host: Inspiron 3501 
   /////76767//7676767//////////////      Kernel: 6.6.10-76060610-generic 
  /////767676///*76767///////////////     Uptime: 2 hours, 50 mins 
 ///////767676///76767.///7676*///////    Packages: 1779 (dpkg), 1 (brew) 
/////////767676//76767///767676////////   Shell: zsh 5.8.1 
//////////76767676767////76767/////////   Resolution: 1920x1080 
///////////76767676//////7676//////////   DE: GNOME 42.5 
////////////,7676,///////767///////////   WM: Mutter 
/////////////*7676///////76////////////   WM Theme: Pop 
///////////////7676////////////////////   Theme: Pop-dark [GTK2/3] 
 ///////////////7676///767////////////    Icons: Pop [GTK2/3] 
  //////////////////////'////////////     Terminal: gnome-terminal 
   //////.7676767676767676767,//////      CPU: 11th Gen Intel i3-1115G4 (4) @ 4 
    /////767676767676767676767/////       GPU: Intel Device 9a78 
      ///////////////////////////         Memory: 1964MiB / 7673MiB 
         /////////////////////
             /////////////                                        
```

## Response

[One of my friends](https://raichusrealm.com/) is a big proponent of Linux in general, so I know that he'll be happy about this change. He's been *gently* nudging me towards it, telling me that I should use Asahi (totally not biased since he uses Fedora) but I keep saying that I'll do it when my Mac is unsupported by macOS [as I said](#why-not-use-asahi-linux).
