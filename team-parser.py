import argparse
import json
import sys, re, time

INDENT = None

def readCommand(argv):
	parser = argparse.ArgumentParser(description='Parse the team list file into json format.')
	parser.add_argument('-i', '--indent', dest='INDENT', type=int, action='store', default=INDENT,
		help='the indent level of output file')
	parser.add_argument('source', action='store',
		help='parse the team list file <source>')
	parser.add_argument('target', action='store',
		help='parse the team list file to the <target>')
	
	args = parser.parse_args(argv)
	return args

def configure(options):
	global INDENT
	TEAM_NUM = options.INDENT

def parse(source):
	with open(source, 'r') as fin:
		result = []
		for line in fin:
			if re.match(r"^1\tteam", line) != None:
				tmp = line.split('\t')
				team = dict()
				team["teamID"] = int(tmp[1][4:])
				team["name"] = tmp[2]
				if tmp[2].find(" -") != -1:
					team["school"], team["name"] = tmp[2].split(' - ')[:2]
				result.append(team)
	return result


def output(target, teams):
	with open(options.target, 'w') as fout:
		global INDENT
		fout.write(json.dumps(teams, indent=INDENT))

if __name__ == '__main__':
	options = readCommand( sys.argv[1:] ) # Get game components based on input
	configure(options)
	teams = parse(options.source)
	output(options.target, teams)
