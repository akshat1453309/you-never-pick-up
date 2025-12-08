/**
 * Game Data - "I'm Fine"
 *
 * All prompts, responses, and phase data for the student burnout typing game
 */

const GAME_DATA = {
    phases: [
        // PHASE 1: "Everything's Under Control" (0-20%)
        {
            name: 'under_control',
            prompts: [
                {
                    asker: 'Mom',
                    question: '"Hey honey, how\'s school going?"',
                    response: 'Good! Everything\'s fine!',
                    timeLimit: 5,
                    guiltAmount: 10,
                    feedback: '"That\'s great! I\'m so proud of you 😊"'
                }
            ],
            stressIndicators: [
                'Assignment due: Tonight',
                'Sleep: 3 hours',
                'GPA: 2.8',
                '',
                ''
            ]
        },

        // PHASE 2: "Just Busy" (20-40%)
        {
            name: 'just_busy',
            prompts: [
                {
                    asker: 'Roommate',
                    question: '"Dude, you look exhausted. You okay?"',
                    response: 'Yeah, just been busy with assignments, haha',
                    timeLimit: 5,
                    guiltAmount: 15,
                    feedback: '"Alright, well... let me know if you need anything"'
                },
                {
                    asker: 'Friend',
                    question: '"Want to grab lunch? Haven\'t seen you in a while"',
                    response: 'I wish! Maybe next week?',
                    timeLimit: 4.5,
                    guiltAmount: 15,
                    feedback: '"Sure... you said that last week too but okay"'
                }
            ],
            stressIndicators: [
                '5 assignments overdue',
                'Last meal: 14 hours ago',
                'Sleep: 2 hrs',
                'Unread emails: 23',
                'Missed calls: 4'
            ]
        },

        // PHASE 3: "I'll Catch Up" (40-60%)
        {
            name: 'ill_catch_up',
            prompts: [
                {
                    asker: 'Professor Chen',
                    question: '"I noticed you missed the last three deadlines. Is everything alright?"',
                    response: 'So sorry Professor! I\'ve been dealing with some things but I\'ll catch up this weekend, I promise!',
                    timeLimit: 7,
                    guiltAmount: 20,
                    feedback: '"Alright, but please reach out if you need help. That\'s what I\'m here for."'
                },
                {
                    asker: 'Mom',
                    question: '"You haven\'t called in two weeks. I\'m starting to worry..."',
                    response: 'I know, I\'m sorry! Just really swamped. I\'ll call this weekend!',
                    timeLimit: 5,
                    guiltAmount: 20,
                    feedback: '"You always say that... please take care of yourself"'
                }
            ],
            stressIndicators: [
                '12 assignments overdue',
                'Sleep debt: 20 hours',
                'GPA: 2.1',
                'Last shower: 3 days',
                'Skipped meals: 8 this week'
            ]
        },

        // PHASE 4: "I'm Managing" (60-75%)
        {
            name: 'im_managing',
            prompts: [
                {
                    asker: 'Best Friend',
                    question: '"Hey, I haven\'t seen you in weeks. Everyone\'s worried. What\'s going on?"',
                    response: 'I know, I\'m sorry! I\'m just really swamped but I\'m managing. I\'ll hang out soon!',
                    timeLimit: 6,
                    guiltAmount: 25,
                    feedback: '"...okay. I\'m here if you need me."'
                },
                {
                    asker: 'Academic Advisor',
                    question: '"Your professors have expressed concerns about your attendance and grades..."',
                    response: 'I understand. I\'m working on it. Things will improve soon.',
                    timeLimit: 5,
                    guiltAmount: 25,
                    feedback: '"We may need to discuss your academic standing if this continues"'
                },
                {
                    asker: 'Roommate',
                    question: '"Are you eating? I never see you anymore..."',
                    response: 'Yeah, I\'m fine. Just eating in my room usually.',
                    timeLimit: 4,
                    guiltAmount: 20,
                    feedback: '"...if you say so"'
                }
            ],
            stressIndicators: [
                'Haven\'t left room: 3 days',
                'Skipped 8 meals this week',
                'Last shower: 4 days ago',
                'Panic attacks: 3 this week',
                'Sleep: 45 min last night'
            ]
        },

        // PHASE 5: "I'M FINE" (75-90%)
        {
            name: 'im_fine',
            prompts: [
                {
                    asker: 'MOM',
                    question: '"HONEY, YOU HAVEN\'T RETURNED MY CALLS. I\'M REALLY WORRIED."',
                    response: 'I\'M FINE MOM I\'LL CALL SOON',
                    timeLimit: 3.5,
                    guiltAmount: 30,
                    feedback: '"..."'
                },
                {
                    asker: 'BEST FRIEND',
                    question: '"ARE YOU AVOIDING ME? DID I DO SOMETHING WRONG?"',
                    response: 'I\'M NOT AVOIDING ANYONE I\'M JUST BUSY',
                    timeLimit: 3.5,
                    guiltAmount: 30,
                    feedback: '"I don\'t believe you anymore"'
                },
                {
                    asker: 'PROFESSOR',
                    question: '"THIS IS YOUR LAST CHANCE TO SUBMIT BEFORE YOU FAIL"',
                    response: 'I\'M HANDLING IT I DON\'T NEED HELP',
                    timeLimit: 3,
                    guiltAmount: 30,
                    feedback: '"I hope that\'s true"'
                },
                {
                    asker: 'ROOMMATE',
                    question: '"I HEAR YOU CRYING AT NIGHT. PLEASE LET ME HELP"',
                    response: 'I\'M FINE JUST STRESSED ABOUT SCHOOL',
                    timeLimit: 3,
                    guiltAmount: 35,
                    feedback: '"Why won\'t you let anyone in?"'
                }
            ],
            stressIndicators: [
                '20+ ASSIGNMENTS OVERDUE',
                'FAILING 3 CLASSES',
                'SLEEP: 45 MIN LAST NIGHT',
                'LAST MEAL: ENERGY DRINK',
                'CAN\'T REMEMBER FEELING OKAY'
            ]
        }
    ]
};
