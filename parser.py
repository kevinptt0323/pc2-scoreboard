import argparse
import json
import sys, re, time

TEAM_NUM = None
PROBLEM_NUM = 12
FREEZE_TIME = -1
PENALTY_PER_SUBMIT = 20
INDENT = None

def readCommand(argv):
	parser = argparse.ArgumentParser(description='Parse the replay report (29th option from pc2report) into json format.')
	parser.add_argument('-t', dest='TEAM_NUM', type=int, action='store',
		help='the number of teams')
	parser.add_argument('-p', dest='PROBLEM_NUM', type=int, action='store', default=PROBLEM_NUM,
		help='the number of problems (default: %d)' % PROBLEM_NUM)
	parser.add_argument('-f', dest='FREEZE_TIME', type=int, action='store', default=FREEZE_TIME,
		help='the time to freeze the scoreboard (min). don\'t set this argument if you want the final result')
	parser.add_argument('-i', '--indent', dest='INDENT', type=int, action='store', default=INDENT,
		help='the indent level of output file')
#	parser.add_argument('-i', '--interactive', dest='INTERACTIVE', action='store_true',
#		help='use interactive mode. other arguments will be ignored')
	parser.add_argument('source', action='store',
		help='parse the report file <source>')
	parser.add_argument('target', action='store',
		help='parse the report file to the <target>')
	
	args = parser.parse_args(argv)
	return args

def configure(options):
	global TEAM_NUM, PROBLEM_NUM, FREEZE_TIME
	TEAM_NUM = options.TEAM_NUM
	PROBLEM_NUM = options.PROBLEM_NUM
	FREEZE_TIME = options.FREEZE_TIME

def parse(source):
	class Run:
		def __init__(self, runid, time, teamID, probID):
			self.runid  = int(runid)
			self.time   = int(time)
			self.teamID = int(teamID[4:])
			self.probID = ord(probID) - ord('A') + 1
			self.pending = True
			self.solved = False
			self.firstBlood = False

		def __repr__(self):
			return "<Run runid:%s time:%s teamID:%s probID:%s pending:%s solved:%s>" % (self.runid, self.time, self.teamID, self.probID, self.pending, self.solved)

		def __lt__(self, rhs):
			return self.runid < rhs.runid
		
		def judge(self, solved):
			self.pending = False
			self.solved = solved

	with open(source, 'r') as fin:
		global PROBLEM_NUM
		result = []
		for line in fin:
			if re.match(r"^action=RUN_SUBMIT", line) != None:
				submit = {}
				for x in line.split('|')[:-1]:
					a, b = x.strip(' ').split('=')
					submit[a] = b
				result.append(Run(submit["id"], submit["elapsed"], submit["submitclient"], submit["problem"]))
			if re.match(r"^action=RUN_JUDGEMENT", line) != None:
				global FREEZE_TIME
				judge = {}
				for x in line.split('|')[:-1]:
					a, b = x.strip(' ').split('=')
					judge[a] = b
				for run in result:
					if run.runid == int(judge["id"]) and (FREEZE_TIME == -1 or run.time <= FREEZE_TIME):
						run.judge(judge["solved"]=="true")
		result.sort()
		solved = [False] * (PROBLEM_NUM+1)
		for run in result:
			if not solved[run.probID] and run.solved:
				run.firstBlood = True
				solved[run.probID] = True
		return result

def run(actions):
	class Team:
		def __init__(self, teamID):
			self.teamID = teamID
			self.runs = []
			self.initResult()

		def __repr__(self):
			_repr = "<teamID:%s solvedN:%d totalPenalty:%d runs:[" % (self.teamID, self.solvedN, self.totalPenalty)
			if len(self.runs):
				_repr += "\n"
			for _ in self.runs:
				_repr += "  %s\n" % _
			_repr += "]>"
			return _repr
		
		def __lt__(self, rhs):
			if self.solvedN != rhs.solvedN:
				return self.solvedN > rhs.solvedN
			return self.totalPenalty < rhs.totalPenalty

		def initResult(self):
			global PROBLEM_NUM
			self.totalPenalty = 0
			self.solvedN = 0
			self.submitN = [0] * (PROBLEM_NUM+1)
			self.penalty = [0] * (PROBLEM_NUM+1)
			self.solved  = [False] * (PROBLEM_NUM+1)
			self.pending  = [False] * (PROBLEM_NUM+1)
			self.firstBlood  = [False] * (PROBLEM_NUM+1)

		def calc(self):
			global FREEZE_TIME, PENALTY_PER_SUBMIT
			self.initResult()
			for run in self.runs:
				if not self.solved[run.probID]:
					if FREEZE_TIME == -1 or run.time <= FREEZE_TIME:
						if run.solved:
							self.penalty[run.probID] = run.time
							self.solved[run.probID] = True
							self.solvedN += 1
							self.totalPenalty += self.submitN[run.probID] * PENALTY_PER_SUBMIT + self.penalty[run.probID]
							self.firstBlood[run.probID] = run.firstBlood
						elif not run.pending:
							self.submitN[run.probID] += 1
					else:
						self.submitN[run.probID] += 1
						self.pending[run.probID] = True
		
		def toJSON(self):
			obj = dict()
			obj["teamID"] = self.teamID
			obj["totalPenalty"] = self.totalPenalty
			obj["solvedN"] = self.solvedN
			obj["submitN"] = self.submitN[1:]
			obj["penalty"] = self.penalty[1:]
			obj["solved"] = map(int, self.solved[1:])
			obj["pending"] = map(int, self.pending[1:])
			obj["firstBlood"] = map(int, self.firstBlood[1:])
			return obj

	global TEAM_NUM
	actions.sort()
	result = [Team(_) for _ in range(TEAM_NUM+1)]
	for run in actions:
		result[run.teamID].runs.append(run)
	return result[1:]

def output(target, status):
	result = dict()
	with open(options.target, 'w') as fout:
		result["status"] = [team.toJSON() for team in status]
		result["generateTime"] = time.strftime("%Y/%m/%d %X")
		fout.write(json.dumps(result))

if __name__ == '__main__':
	options = readCommand( sys.argv[1:] ) # Get game components based on input
	configure(options)
	actions = parse(options.source)
	status = run(actions)
	for team in status:
		team.calc()

	output(options.target, status)
