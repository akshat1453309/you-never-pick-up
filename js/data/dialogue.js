/**
 * Dialogue Data - All conversation content
 *
 * Structure:
 * - Each caller has an array of messages
 * - Messages can be type 'caller' or 'choice'
 * - Caller messages display automatically
 * - Choice messages show player dialogue options
 */

const DIALOGUE = {
    /**
     * MOM - Need for approval/validation
     * Act 1: Normal, caring mother checking in
     */
    mom: {
        messages: [
            {
                type: 'caller',
                text: 'Hi honey, just calling to check in.'
            },
            {
                type: 'caller',
                text: "I haven't heard from you in a while. Are you okay?"
            },
            {
                type: 'choice',
                choices: [
                    {
                        text: "Yeah, I'm fine. Just busy.",
                        next: 3
                    },
                    {
                        text: "Sorry, I've been meaning to call.",
                        next: 3
                    }
                ]
            },
            {
                type: 'caller',
                text: 'You always say that. You sound tired.'
            },
            {
                type: 'caller',
                text: 'Are you eating properly? Getting enough sleep?'
            },
            {
                type: 'choice',
                choices: [
                    {
                        text: "I'm taking care of myself, don't worry.",
                        next: 6
                    },
                    {
                        text: "I... I'm trying my best.",
                        next: 6
                    }
                ]
            },
            {
                type: 'caller',
                text: 'I just worry about you, you know that.'
            },
            {
                type: 'caller',
                text: 'Call me when you have time? I miss hearing your voice.'
            }
            // Conversation ends here for Day 1
            // Will be expanded with interruptions and more calls in Day 2
        ]
    }

    // Additional callers will be added in Day 2+
    // friend: { ... },
    // partner: { ... },
    // unknown: { ... }
};
