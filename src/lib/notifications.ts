
"use client";

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const threateningMessages = [
    "Looks like you forgot your daily skill again. You know what happens now...",
    "Don't make me come over there. Your skill is waiting.",
    "Your streak is hanging by a thread. Don't disappoint me.",
    "Psst! That little flame icon is looking awfully sad right now.",
    "This is your last warning. Open Drillzy. Now.",
    "I see you. I know you haven't done your skill yet. The clock is ticking.",
    "Neglecting your skills has consequences. You wouldn't want to find out what they are.",
    "Are you really going to let a little thing like 'being busy' break your streak?",
    "Your potential is slipping away... along with your streak. Get to it.",
    "I'm not mad, just disappointed. And a little mad.",
    "That skill isn't going to complete itself. Or will it? Let's not find out.",
    "Remember that goal you had? It remembers you.",
    "The app is quiet... too quiet. Let's fix that.",
    "Your streak is calling for help. Are you going to answer?",
    "Another day, another chance to not let me down.",
    "Is this ghosting? It feels like ghosting.",
    "Don't make me send a search party. Do your skill.",
    "I've got a notification and I'm not afraid to use it. Repeatedly.",
    "Your daily dose of 'you can do it' is here. Or else.",
    "Procrastination is a skill. But not the one you're supposed to be practicing today.",
    "Let's turn that 'I'll do it later' into 'I did it'. Now.",
    "I'm starting to think you don't care about us anymore.",
    "Your streak misses you. And so do I. But mostly the streak.",
    "Do it. Or the happy little flame icon gets it.",
    "Achievement unlocked: 'Ignoring Your Goals'. Let's try for a different one.",
    "The path to success is paved with completed daily skills. Your move.",
    "I believe in you. But my patience is finite.",
    "This is the easiest part of your day. Don't mess it up.",
    "All your progress is on the line. No pressure.",
    "Today's forecast: 100% chance of needing to complete your skill.",
    "You wouldn't skip leg day, would you? Don't skip skill day.",
    "Let's not make this harder than it needs to be.",
    "I've seen your potential. Don't hide it.",
    "We had a deal. A skill a day. Remember?",
    "Your phone is buzzing for a reason. And it's me.",
    "Don't let that streak number go back to zero. Think of the shame.",
    "I'm not asking for much. Just one little skill.",
    "The future you is begging you to do this.",
    "Let's keep the momentum going. Or start it. Whatever works.",
    "Your skills aren't the only thing getting rusty.",
    "I can do this all day. Can you?",
    "A journey of a thousand miles begins with a single tap. This one.",
    "Don't be a hero. Just do the skill.",
    "I'm the friendly reminder you can't get rid of.",
    "Tick-tock. The streak clock is unforgiving.",
    "Your brain is hungry. Feed it a new skill.",
    "Ignoring me won't make the task disappear. It just makes me louder.",
    "This is an intervention. Put down the cat video and open Drillzy.",
    "You have 1 new message from your ambition. It says 'get to work'.",
    "Don't make me use the disappointed emoji.",
    "Let's make today productive. Starting now.",
    "I'm programmed to believe in you. Don't prove me wrong.",
    "The only thing standing between you and your goal is opening this app.",
    "I'm not a regular app, I'm a cool app that cares about your growth. Intensely.",
    "Your streak is a delicate flower. Water it.",
    "Are we doing this or not? The suspense is killing me.",
    "I see that you're 'busy'. I'm 'patiently waiting'. For now.",
    "One skill a day keeps the 'what ifs' away.",
    "You can't spell 'progress' without 'press'. So press the button.",
    "Let's not give up on our dreams today. Okay?",
    "You miss 100% of the skills you don't do. - Me",
    "Is this your final answer? Ignoring me?",
    "I'm running out of creative ways to say 'do your task'.",
    "Your comfort zone called. It said you're not welcome back until you're done.",
    "This is me, your conscience, in app form.",
    "Don't let the flame go out. It's cold in here.",
    "Today's skill is sponsored by: 'You can do this!'",
    "Let's add another link to the chain of success.",
    "Your streak is looking a little pale. It needs a win.",
    "I've prepared a lovely skill for you. It would be a shame if someone... ignored it.",
    "You know the drill. It's in the name.",
    "This notification will self-destruct in... just kidding, it'll be back tomorrow.",
    "I've got my eye on you. And your streak.",
    "Don't make me use my outside voice.",
    "This is not a drill. Well, actually, it is. So do it.",
    "Let's make future-you proud.",
    "Your daily appointment with greatness is now.",
    "Success doesn't come from what you do occasionally, but what you do daily.",
    "Be stronger than your strongest excuse.",
    "I'm not nagging, I'm 'aggressively encouraging'.",
    "The distance between your dreams and reality is called action. So, act.",
    "You're so close to building a great habit. Don't stop now.",
    "Let's check this off the list together.",
    "Your daily brain-pushup is ready.",
    "A little progress each day adds up to big results. Let's add some.",
    "That skill isn't just gonna learn itself, you know.",
    "Come on, just five minutes. You can do anything for five minutes.",
    "The leagues are watching. Make them proud. Or jealous.",
    "Don't let the red notification badge win.",
    "This app is powered by your progress. I'm running on fumes here.",
    "I'm here to remind you that you're awesome and capable. Now prove it.",
    "Your streak is my life force. Don't unplug me.",
    "This is the part where you become the hero of your own story.",
    "Let's be better than we were yesterday. Starting with this skill.",
    "I've calculated 14,000,605 futures. The one where you keep your streak is the best.",
    "Are you going to let a notification outsmart you? I didn't think so.",
    "This is a hold-up. Hand over your completed skill and nobody gets hurt.",
    "Roses are red, violets are blue, your daily skill is waiting for you.",
    "Help me, you're my only hope... for keeping this streak alive.",
    "I'm like a Tamagotchi, but for your goals. Feed me a completed skill.",
    "You have a skill to complete. This is the way.",
    "I'm not saying I'm a genie, but I can help make your wishes for self-improvement come true.",
    "Warning: streak may be lost if ignored. This is not a test.",
    "The council of future-yous has voted. You must complete the skill.",
    "It's dangerous to go alone! Take this skill.",
    "Get in, loser. We're learning skills.",
    "You think this is a game? It is. And you're about to lose a life (your streak).",
    "I'm the guardian of your goals. You shall not pass... without doing your skill.",
    "One does not simply walk into a new day without doing their skill.",
    "May the force be with you... to complete this task.",
    "This is the way... to a longer streak.",
    "I have a very particular set of skills. Skills I require you to learn.",
    "This is your wake-up call. From your ambition.",
    "I'm the whisper of 'you can do it' in a world of 'I'll do it tomorrow'.",
    "Let's not let 'later' become 'never'.",
    "Your streak is a reflection of your commitment. How's it looking?",
    "The secret to getting ahead is getting started. So...?",
    "Small steps, big progress. Let's take a step.",
    "You're building a monument to your discipline, one day at a time.",
    "The version of you that has a 100-day streak started with today.",
    "Don't break the chain.",
    "I'm the accountability partner that fits in your pocket.",
    "Let's make today count. For real this time.",
    "This is your daily reminder that you are capable of amazing things.",
    "One skill closer to the person you want to be.",
    "That little checkmark isn't going to check itself.",
    "Your competition in the leagues isn't taking a day off. Just saying.",
    "Let's earn that dopamine hit.",
    "Your brain gets bored. Let's give it something new to chew on.",
    "I'm here to turn your 'shoulds' into 'dids'.",
    "Don't just be busy, be productive.",
    "The pain of discipline or the pain of regret. Your choice.",
    "I'm like a personal trainer, but for your life skills.",
    "Your daily upgrade is available. Please install by completing the skill.",
    "Your future self will thank you. Your present self might curse me. It's a price I'm willing to pay.",
    "This is a robbery. Of your excuses.",
    "I'm not saying I'm your only friend, but I'm the only one who reminds you to be better.",
    "Are you lost? The path to your goals is through this app.",
    "This is a message from the CEO of 'Getting Things Done'. He says you're late for your meeting.",
    "I'm the only app that will judge you for not using it.",
    "Let's do this. Unless you're a chicken.",
    "Your streak is a sourdough starter. It needs daily attention or it dies.",
    "The difference between a goal and a dream is a deadline. And me.",
    "Let's show Monday who's boss. (It's you. After you do this skill.)",
    "You've scrolled this far. You can scroll into the app.",
    "I'm not saying you have to, but your streak would really appreciate it.",
    "Your daily dose of betterment is ready for consumption.",
    "I'm the bouncer at Club Progress, and you're on the list. Come on in.",
    "Let's make that little flame icon do a happy dance.",
    "You're in a codependent relationship with this streak. Don't be the one to mess it up.",
    "I'm the little voice in your head, now with push notifications.",
    "Your bed will still be there in 5 minutes. Your streak might not be.",
    "This is a reminder from the 'Don't Be a Slacker' foundation.",
    "Let's get this bread. This daily, skill-based bread.",
    "I'm your digital Jiminy Cricket. Let your conscience be your guide... to the app.",
    "You're playing a dangerous game with that streak, my friend.",
    "This is a public service announcement for your personal growth.",
    "I'm the ghost of your streak's future. It's not looking good unless you act now.",
    "I'm not mad, I'm just aggressively concerned for your progress.",
    "The league table doesn't lie. Let's climb it.",
    "Your phone wanted me to tell you to stop ignoring your potential.",
    "This notification is a contract. You tap it, you do the skill. Deal?",
    "I've seen things you people wouldn't believe. Streaks on fire off the shoulder of Orion... Time to learn.",
    "This app has feelings, you know. And right now, it feels neglected.",
    "Let's do the thing. You know the thing.",
    "The best time to do your skill was yesterday. The second best time is now.",
    "I'm the friendly neighborhood reminder app.",
    "Your potential is knocking. Are you going to answer the door?",
    "I'm the 'before' picture. Let's work on the 'after'.",
    "Don't let your dreams be dreams. Just do it.",
    "I'm not just an app, I'm a lifestyle. A very demanding lifestyle.",
    "Let's make some progress you can be proud of.",
    "Your streak is beautiful. Let's keep it that way.",
    "The world is your oyster, but you still have to do your daily skill.",
    "This is the part where you level up.",
    "I'm the only notification that's actually good for you.",
    "Your brain called. It wants a workout.",
    "Let's turn that red badge into a green checkmark.",
    "You vs. the temptation to procrastinate. Who will win?",
    "Your daily challenge has been issued. Do you accept?",
    "I'm the guardian of the streak. None shall pass... up on their daily skill.",
    "Let's add another brick to the wall of your success.",
    "I'm the shepherd, you're the sheep. Let's get you to the pasture of progress.",
    "This is the sign you were looking for. The sign to do your skill.",
    "I'm the only thing standing between you and a day of regret.",
    "Let's make today a 'completed' day.",
    "Your daily quest is available. The reward is a sense of accomplishment.",
    "I'm the reminder you need, not the one you deserve right now. But you still need me.",
    "Let's do this, champ. No, really. I'm calling you champ.",
    "The journey to self-improvement is long. Let's take the next step.",
    "I'm your personal cheerleader, but with more passive aggression.",
    "Your daily mental floss is ready.",
    "Let's make your ancestors proud. Or at least not ashamed.",
    "This is a test of the emergency motivation system. This is not a test. Do it.",
    "I'm the key to your success. But you have to turn me.",
    "Let's get this show on the road. The show of you being awesome.",
    "Your daily skill is like a vitamin for your brain. Don't skip it.",
    "I'm the only app that loves you enough to be this annoying.",
    "Let's make that progress bar move.",
    "Your future self is watching. Don't make it cringe.",
    "I'm the Gandalf to your Frodo. You must take the skill to Mordor (completion).",
    "Let's build a habit so strong it's a reflex.",
    "Your daily brain-snack is waiting.",
    "I'm the only thing that's not trying to sell you something. Except your own potential.",
    "Let's make today ridiculously productive.",
    "Your daily appointment with discipline has arrived.",
    "I'm the voice of reason in a sea of distractions.",
    "Let's not let the sun go down on this uncompleted skill.",
];

export const checkPermissions = async (): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'web') return false;
    let { display } = await LocalNotifications.checkPermissions();
    return display === 'granted';
};

export const requestPermissions = async (): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'web') return false;
    let { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
};

export const scheduleDailyNotification = async (time: string): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'web') return false;
    
    try {
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
            const granted = await requestPermissions();
            if (!granted) return false;
        }

        // Cancel any existing notifications to avoid duplicates
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
        }

        const [hour, minute] = time.split(':').map(Number);
        const randomMessage = threateningMessages[Math.floor(Math.random() * threateningMessages.length)];

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 1, // Unique ID for this notification
                    title: 'Drillzy Needs You!',
                    body: randomMessage,
                    schedule: {
                        on: {
                            hour: hour,
                            minute: minute,
                        },
                        repeats: true, // Repeat daily at the specified time
                    },
                    sound: 'default',
                    smallIcon: 'ic_stat_icon_config_sample', // Make sure you have this icon in your android/app/src/main/res/drawable folders
                    channelId: 'drillzy_reminders',
                },
            ],
        });
        
        return true;
    } catch (error) {
        console.error("Error scheduling notification:", error);
        return false;
    }
};

export const cancelAllNotifications = async (): Promise<void> => {
    if (Capacitor.getPlatform() === 'web') return;
    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
        }
    } catch (error) {
        console.error("Error cancelling notifications:", error);
    }
}

    