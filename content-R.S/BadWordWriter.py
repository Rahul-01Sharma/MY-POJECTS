# List of adult, abusive, and curse words
bad_words = [
    "abuse", "Abuse", "ABUSE", 
    "idiot", "Idiot", "IDIOT", 
    "stupid", "Stupid", "STUPID", 
    "dumb", "Dumb", "DUMB", 
    "fool", "Fool", "FOOL", 
    "moron", "Moron", "MORON", 
    "crap", "Crap", "CRAP", 
    "hell", "Hell", "HELL", 
    "damn", "Damn", "DAMN", 
    "bastard", "Bastard", "BASTARD", 
    "bitch", "Bitch", "BITCH", 
    "asshole", "Asshole", "ASSHOLE", 
    "shit", "Shit", "SHIT", 
    "fuck", "Fuck", "FUCK", 
    "bullshit", "Bullshit", "BULLSHIT", 
    "douche", "Douche", "DOUCHE", 
    "whore", "Whore", "WHORE", 
    "slut", "Slut", "SLUT", 
    "jerk", "Jerk", "JERK", 
    "loser", "Loser", "LOSER", 
    "bloody", "Bloody", "BLOODY", 
    "piss", "Piss", "PISS", 
    "darn", "Darn", "DARN", 
    "freak", "Freak", "FREAK", 
    "screw", "Screw", "SCREW", 
    "nuts", "Nuts", "NUTS", 
    "prick", "Prick", "PRICK", 
    "twit", "Twit", "TWIT", 
    "wanker", "Wanker", "WANKER", 
    "scumbag", "Scumbag", "SCUMBAG", 
    "arse", "Arse", "ARSE", 
    "knob", "Knob", "KNOB", 
    "tosser", "Tosser", "TOSSER", 
    "git", "Git", "GIT", 
    "cretin", "Cretin", "CRETIN", 
    "imbecile", "Imbecile", "IMBECILE"
]


# Specify the file name
file_name = "BadWords.txt"

# Write the words to the file
try:
    with open(file_name, "w") as file:
        for word in bad_words:
            file.write(word + "\n")
    print(f"Bad words list has been written to '{file_name}'.")
except Exception as e:
    print(f"An error occurred: {e}")
