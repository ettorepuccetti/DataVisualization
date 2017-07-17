import csv
import networkx as nx
from itertools import groupby
import json
import matplotlib.pyplot as plt
import dateutil.parser

#apre i file csv, li raggruppa e ordina, prende i top 10 nodi di ogni file come centro e genera

def generaNodi(day):
    watchNodes = []
    #apro il file aggregato per prendermi i nodi da osservare
    for hour in range(8,24):
        with open ("assets/data/counter_per_hour/sender_count_"+day+"_"+str(hour)+".csv") as csvfile:
            printer = csv.reader(csvfile)
            next(printer)
            for i in range(0,10):
                watchNodes.append(next(printer)[0])
            csvfile.close()
    
    for hour in range(8,24):
        with open ("assets/data/counter_receiver_per_hour/receiver_count_"+day+"_"+str(hour)+".csv") as csvfile:
            printer = csv.reader(csvfile)
            next(printer)
            for i in range(0,10):
                watchNodes.append(next(printer)[0])
            csvfile.close()
    
    watchNodes = list(set(watchNodes))
    with open('assets/data/ego_per_hour/'+day+'/listanodiscript.json', 'w+') as outjson:
        json.dump({"watchnodes":list(map(lambda x: x.replace("'","\""),watchNodes))}, outjson)
    

def generaEgoNetwork(hour,day):
    values = []
    
    #leggo dal file json la lista di tutti i nodi per cui devo costruire una ego
    with open ("assets/data/ego_per_hour/"+day+"/listanodiscript.json") as nodijson:
        watchNodes = json.load(nodijson)
    watchNodes = watchNodes['watchnodes']

    #apro il file grezzo, con tutti i timestamp per costruirmi la rete
    with open ("assets/data/sender_per_hour/sender_count_"+day+"_"+hour+".csv") as csvfile:
        printer = csv.reader(csvfile)
        next(printer)
        for row in printer:
            values.append(row)
    
    values.sort(key=lambda x: (x[1],x[2]))
    
    graph_list = []
    for key, group in groupby(values, lambda x: (x[1],x[2])):
        graph_list.append({
            'sender': key[0],
            'receiver': key[1],
            'count': sum(1 for _ in group),
        })
    
    graph = nx.DiGraph()
    graph.add_weighted_edges_from([(i['sender'],i['receiver'],i['count']) for i in graph_list])

    for center in watchNodes:
        if center == '1278894':
            continue
       
        #commentare le prime due righe in caso si voglia la vera EgoNetwork, la 3 per vedere solo i messaggi partiti dal nodo
        #ego_net = nx.DiGraph()
        #ego_net.add_weighted_edges_from( [(i[0],i[1],i[2]['weight']) for i in graph.edges([center],data=True)] )
        
        if center not in graph.nodes():
            print ('centro non presente nel grafo'+ center)
            continue
        
        ego_net = nx.ego_graph(graph, n=center, undirected=True)


        '''
        #estraggo in una lista i 10 archi che pesano di più
        #creo un grafo di appoggio a partire da quegli archi,
        #per ottenere facilmente la lista dei nodi 
        
        links = ego_net.edges(data=True)
        links.sort(key=lambda x: x[2]['weight'], reverse=True)
        links = links[0:5]
        aux_graph = nx.DiGraph(links)

        #girare il grafico, salvandomi su un grafo di appoggio
        #prendere i 10 nodi che pesano di più che coinvolgono il center
        #costruirci un altro digraph aux_reversed per poter girare i link, girare quel grafico,
        #estrarre la lista degli archi e aggiungerli ad aux_graph
        
        aux_graph_reversed = nx.reverse(graph)
        links_reversed = aux_graph_reversed.edges([center],data=True)
        links_reversed.sort(key=lambda x: x[2]['weight'], reverse=True)
        links_reversed = links_reversed[0:5]
        aux_graph_reversed = nx.DiGraph(links_reversed)
        nx.reverse(aux_graph_reversed, copy=False)
        aux_graph.add_weighted_edges_from([(i[0],i[1],i[2]['weight']) for i in aux_graph_reversed.edges(data=True)])
        '''
        #da li mi creo il dizionario
        ego_json = {
            "nodes": list(map(lambda x: {"id":x}, ego_net.nodes())),
            "links": list(map(lambda edge: {
                "source" : ego_net.nodes().index(edge[0]),
                "target" : ego_net.nodes().index(edge[1]),
                "value" : edge[2]['weight']
            }, filter(lambda x: x[2]['weight'] > 1, ego_net.edges(data=True))))
        }

        with open('assets/data/ego_per_hour/'+day+'/'+day+'_'+hour+'_'+center+'.json', 'w+') as outjson:
            json.dump(ego_json, outjson)



for day in ['Fri','Sat','Sun']:
    generaNodi(day)
    #for hour in range(8,9):
    #    generaEgoNetwork(str(hour),day)