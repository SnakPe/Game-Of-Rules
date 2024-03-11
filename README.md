# Game of Life

A (very limited) creator for cellular automata

## Motivation

In my short lifetime, I implemented the Conway's Game of Life multiple times.
It is almost a ritual for me, to implement it when I learn a new language for long enough.
For some reason, I just can't get it out of my head.
But this time, I decided that instead of just doing the same old boring GoL, I would jump out of my shadow and create something better.
After seeing <a href="https://www.youtube.com/watch?v=WMJ1H3Ai-qs">this video</a>, I decided to create this project

## Try it out

You can try it out at http://snakescale.ddns.net/Game-Of-Rules/

## How to use

In the middle you can see a grid. On it, you can "draw" various states with different rules. These rules can be seen when clicking on a state in the list of states on the top right.
Depending on the <a href="https://en.wikipedia.org/wiki/Moore_neighborhood">8 neighbours around a state</a>, the cell will change to a new state, or it will stay the same if none of the rules apply.

## How to create your own automata

To create a new automata, you will need to define a ruleset. For that, use the **Ruleset Creator** on the right

### States

First, create all the states that you need with the **State Creator**. You can select different colors for each state, and then add them with the **Add State** button.</br>
After creating at least 2 states, you can see a state with a <span style="border: green solid 2px">green border</span>, and one with a <span style="border: red solid 2px">red border</span>.
These will be important in the next section

### Transition rules

Now we are able to create the interesting stuff! For now, our states don't do anything, so we need to add some _life_ into them.</br>
We can do exacly that by using the **Transition Creator**</br> 
The red and green-bordered states in the state list tell you which state your rule applies to, and what state it will transition to.</br>
For example, if state 1 has a green, and state 2 has a red border, then a cell in state 1 will transition to state 2, if your rule is satisfied.</br>
To define your rule, use the 3x3 grid below. The only important thing here is the amount of states in the neighbourhood.

Yur are done! Click on **Create Ruleset**, and you can start playing around



