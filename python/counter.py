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

def generaCsvSenderAll(filename,day):
    filtered_list = []
    with open (filename) as csvfile:
        printer = csv.reader(csvfile)
        next(printer)
        for row in printer:
            filtered_list.append(row)
        
    compactAndDumpList(filtered_list,'all',day)



#prende la lista tagliata per ora, e raggruppa per count di mittente
def compactAndDumpList(filtered_list,hour,day):
    filtered_list.sort(key=lambda x: x[1])

    grouped_list = []
    for key, group in groupby(filtered_list, lambda x: x[1]):
        grouped_list.append((key,sum(1 for _ in group)))
    
    grouped_list.sort(key=lambda x: x[1],reverse=True)


    with open ('assets/data/counter_per_hour/sender_count_'+day+'_'+str(hour)+'.csv','w+',newline='') as csvout:
        mywriter = csv.writer(csvout, delimiter = ",")
        mywriter.writerow(['sender','count'])
        for e in grouped_list:
            mywriter.writerow(e)

#prende la lista del file tagliata per ora, li ordina per mittente ma NON raggruppa (servono per le ego)
def DumpList(filtered_list,hour,day):

    filtered_list.sort(key=lambda x: x[1])

    with open ('assets/data/sender_per_hour/sender_count_'+day+'_'+str(hour)+'.csv','w+',newline='') as csvout:
        mywriter = csv.writer(csvout, delimiter = ",")
        for e in filtered_list:
            mywriter.writerow(e)


for day in ['Sat','Sun']:
    generaCsvSenderAll('assets/data/comm-data-'+day+'.csv',day)
