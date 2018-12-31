Vue.use(VueResource);

Vue.component("song-render", {
    props: {
        chords: Array,
        lyrics: Array,
        songKey: String
    },
    // Using given chords (array of chords) and lyrics (array of array of
    // lines), produce DOM elements, with everything wrapped in a nice pre
    render(createElement) {
        let ind = 0;
        let children = [];
        for (let line of this.lyrics) {
            let lyricRender = [];
            let chordRender = [];
            let wasChord = false;

            for (let c of line) {
                if (c == "_" && !wasChord) {
                    // First chord in a row (maybe)
                    chordRender[chordRender.length - 1] = this.chords[ind++];
                    wasChord = true;
                } else if (c == "_" && wasChord) {
                    // Not the first chord in a row (but a chord)
                    chordRender.push(this.chords[ind++]);
                    wasChord = true;
                } else if (c == " ") {
                    // Add spacers when you see spaces; easy on the eyes
                    lyricRender.push("　　　　");
                    chordRender.push("　　　　");
                    wasChord = false;
                } else {
                    // Add spaces to chords if some normal character
                    lyricRender.push(c);
                    chordRender.push("　");
                    wasChord = false;
                }
            }

            // If we have an empty line, insert a new line as spacing
            if (line.length === 0) {
                children.push("\n");
            } else {
                children.push(chordRender.join(""));
                children.push(lyricRender.join(""));
            }
        }

        return createElement("pre", ["Key: " + this.songKey + "\n\n",
                                     children.join("\n")]);
    }
});

var app = new Vue({
    el: "#song-app",
    data: {
        chords: [],
        lyrics: [],
        key: "C",
        keyTable: [
            "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
        ],
        altTable: [],   // Generated at runtime
        equivTable: {
            "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb"
        }
    },
    methods: {
        // My mod function, because JS doesn't do negative modding correctly
        mod(x, n) {
            if (x > 0) {
                return x % n;
            } else {
                return (n + x) % n;
            }
        },
        // Converts the text (any variation of chords) into the index, indexed
        // by keyTable
        getKeyIndex(c) {
            let currInd = 0
            if (c.length === 1) {
                currInd = this.keyTable.indexOf(c);
            } else {
                if (c[1] == "#" || c[1] == 'b') {
                    currInd = this.keyTable.indexOf(c.slice(0, 2));
                    if (currInd === -1) {
                        currInd = this.altTable.indexOf(c.slice(0, 2));
                    }
                } else {
                    currInd = this.keyTable.indexOf(c[0]);
                }
            }
            return currInd;
        },
        // Replace the text (chords) with the altered index (next); curr is the
        // current index for reference. Distinguishes between sharps and flats.
        correctKeyReplace(txt, curr, next) {
            let useAlt = txt.indexOf("b") !== -1;
            if (useAlt) {
                curr = this.altTable[curr];
                next = this.altTable[next];
            } else {
                curr = this.keyTable[curr];
                next = this.keyTable[next];
            }
            return txt.replace(curr, next);
        },
        // Transpose all chords up a semitone
        // Called when you click the up button
        transposeUp() {
            this.chords = this.chords.map(c => {
                let ind = this.getKeyIndex(c);
                let newInd = this.mod(ind + 1, this.keyTable.length);
                return this.correctKeyReplace(c, ind, newInd)
            });
            this.key = this.keyTable[this.mod(this.getKeyIndex(this.key) + 1,
                                              this.keyTable.length)];
        },
        // Transpose all chords down a semitone
        // Called when you click the down button
        transposeDown() {
            this.chords = this.chords.map(c => {
                let ind = this.getKeyIndex(c);
                let newInd = this.mod(ind - 1, this.keyTable.length);
                return this.correctKeyReplace(c, ind, newInd)
            });
            this.key = this.keyTable[this.mod(this.getKeyIndex(this.key) - 1,
                                              this.keyTable.length)];
        }
    },
    created: function() {
        // Generate the alternative table for ref
        this.altTable = this.keyTable.map(key => {
            if (!this.equivTable.hasOwnProperty(key)) {
                return key;
            } else {
                return this.equivTable[key];
            }
        });
        // Get the actual data (chords, lyrics, and key)
        this.$http.get(dataLink).then(resp => {
            if (resp.status === 200) {
                this.chords = resp.body.chords;
                this.lyrics = resp.body.lyrics;
                this.key = resp.body.key;
            } else {
                console.log(s);
            }
        }) ;
    }
});
