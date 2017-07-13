import csv
from itertools import groupby
from operator import itemgetter
import dateutil.parser


def generaCsvSender(filename,day):
    filtered_list = []
    hour = 8
    hourEncontered = False
    with open (filename) as csvfile:
        printer = csv.reader(csvfile)
        next(printer)
        for row in printer:
            if (dateutil.parser.parse(row[0]).hour == hour):
                filtered_list.append(row)
            else:
                DumpList(filtered_list,hour,day)
                filtered_list = [row]
                hour = hour + 1

        #per generare l'ultimo file (ore 23) perchè hour non supera mai il valore 23
        DumpList(filtered_list,hour,day)

    
def compactAndDumpList(filtered_list,hour,day):

    #ordinati per destinatario stavolta (x[2])
    filtered_list.sort(key=lambda x: x[2])

    grouped_list = []
    for key, group in groupby(filtered_list, lambda x: x[2]):
        grouped_list.append((key,sum(1 for _ in group)))
    
    grouped_list.sort(key=lambda x: int(x[1]),reverse=True)

    with open ('assets/data/counter_receiver_per_hour/receiver_count_'+day+'_' + str(hour) + '.csv', 'w+', newline='') as csvout:
        mywriter = csv.writer(csvout, delimiter = ",")
        mywriter.writerow(['receiver','count'])
        for e in grouped_list:
            mywriter.writerow(e)

def DumpList(filtered_list,hour,day):

    #ordinati per destinatario stavolta (x[2])
    filtered_list.sort(key=lambda x: x[2])

    with open ('assets/data/receiver_per_hour/receiver_count_'+day+'_' + str(hour) + '.csv', 'w+', newline='') as csvout:
        mywriter = csv.writer(csvout, delimiter = ",")
        for e in filtered_list:
            mywriter.writerow(e)

for day in ['Fri','Sat','Sun']:
    generaCsvSender('assets/data/comm-data-'+day+'.csv',day)
