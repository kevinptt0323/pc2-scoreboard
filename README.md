# PC^2 Scoreboard

The system to parse [pc^2 system](http://www.ecs.csus.edu/pc2/) result to a json file, and generate the scoreboard according to the json.

## Requirements

- pc^2 9.2.4
- python 2.7

## Implementation

I use `bin/pc2report` in pc^2 to dump the replay runs:

	> sh bin/pc2report --contestPassword [PASSWORD] --profile 1 29

## Parser

### parser.py

Parse the replay report file (txt) into json format. Use `python parser.py --help` to show help message.

### team-parser.py

Parse the team list file into json format. Use `python team-parser.py --help` to show help message.

### autodump.py

Dump the replay report file and call parser.py. You can use this script minutely to update `status.json`.

## Scoreboard

I use [React](https://github.com/facebook/react) and [Semantic-UI](https://github.com/Semantic-Org/Semantic-UI) to the scoreboard.

### Requirements for Development

- Node.js 0.12.0
- npm
- bower

### Development

Run the commands for the first time:

	> npm install
	> bower install
	
Run the command while releasing webpage:

	> gulp
