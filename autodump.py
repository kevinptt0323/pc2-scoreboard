from subprocess import call, Popen, PIPE
import sys, os
import config

ORI_DIR = os.getcwd()
REPORT  = 'replay.txt'
STATUS  = 'dist/status.json'

os.chdir(config.PC2_DIR)
call('rm -rf report.Extract_Replay_Runs.*', shell=True)
call(['sh', 'bin/pc2report', '--contestPassword', config.PASSWD, '--profile', '1', '29'])
call('rm -rf report.Extract_Replay_Runs.*.files', shell=True)
call(('mv report.Extract_Replay_Runs.*.txt %s' % os.path.join(ORI_DIR, REPORT)), shell=True)
os.chdir(ORI_DIR)
call('python parser.py -t %d -p %d -f %d %s %s' % (config.TEAM_NUM, config.PROBLEM_NUM, config.FREEZE_TIME, REPORT, STATUS), shell=True)
call('rm %s' % REPORT, shell=True)

