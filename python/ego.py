import csv
import networkx as nx
from itertools import groupby
import json
#import matplotlib.pyplot as plt
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


def generaNetworkxGraphCompleto(filename,hour,day):
    values = []

    #apro il file grezzo, con tutti i timestamp per costruirmi la rete
    with open (filename) as csvfile:
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
    return graph
    

def generaReteCompleta(hour,day):   
    if hour == 'all':
        graph = generaNetworkxGraphCompleto("assets/data/comm-data-"+day+".csv",hour,day)
    else:
        graph = generaNetworkxGraphCompleto("assets/data/sender_per_hour/sender_count_"+day+"_"+hour+".csv",hour,day)

    #genero il file della rete completa di questa ora per passarla a infomap
    with open ("assets/data/complete_network/edgelist_"+day+"_"+hour+".csv","w+", newline="") as csvout:
        mywriter = csv.writer(csvout, delimiter = " ")
        graph_node = graph .nodes()
        mywriter.writerow(["*Vertices",str(len(graph_node))])
        for i,n in enumerate(graph.nodes()):
            mywriter.writerow([i,n])
        mywriter.writerow(["*Edges",str(len(graph.edges(data=True)))])
        for e in graph.edges(data=True):
            mywriter.writerow([graph_node.index(e[0]), graph_node.index(e[1]), e[2]['weight']])
    

def riempiDizionarioComm(day):
    #devo riaprire il file della rete completa assets/data/complete_network/edgelist_"+day+"_all.csv"
    # e scrivere nel dizionario a che nodo corrisponde il numero di nodo che ho nel file aperto nella cartella communities

    comm_dict = {}
    #leggo dal file clu la comunità a cui ogni nodo appartiene
    with open ("assets/data/communities/edgelist_"+day+"_all.clu") as csvfile:
        printer = csv.reader(csvfile, delimiter= " ")
        next(printer)
        next(printer)
        for row in printer:
            #se ancora la chiave non esiste, creala, sennò aggiungi alla lista relativa alla chiave selezionata
            if row[0] not in comm_dict.keys():
                comm_dict[row[0]] = [row[1]]
            else:
                print (row)
                print("c'è un problema, nodo ripetuto..")

def generaEgoNetwork(hour,day):
    graph = generaNetworkxGraphCompleto("assets/data/sender_per_hour/sender_count_"+day+"_"+str(hour)+".csv",hour,day)
    
    #leggo dal file json la lista di tutti i nodi per cui devo costruire una ego
    with open ("assets/data/ego_per_hour/"+day+"/listanodiscript.json") as nodijson:
        watchNodes = json.load(nodijson)
    watchNodes = watchNodes['watchnodes']

    
    for center in watchNodes:
        if center == '1278894':
            continue
       
        #commentare le prime due righe in caso si voglia la vera EgoNetwork, la 3 per vedere solo i messaggi partiti dal nodo
        #ego_net = nx.DiGraph()
        #ego_net.add_weighted_edges_from( [(i[0],i[1],i[2]['weight']) for i in graph.edges([center],data=True)] )
        
        if center not in graph.nodes():
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

        for node in ego_net.nodes():
            if node not in comm_dict.keys():
                print(node)
                comm_dict[node] = 0

        #da li mi creo l'oggetto da scrivere su json
        ego_json = {
            "nodes": list(map(lambda node: {
                "id":node,
                "group": comm_dict[node],
                "neighbors": list(filter(lambda x: ego_net[node][x]['weight'] > 1, ego_net[node]))
            }, ego_net.nodes())),
            "links": list(map(lambda edge: {
                "source" : ego_net.nodes().index(edge[0]),
                "target" : ego_net.nodes().index(edge[1]),
                "value" : edge[2]['weight'] 
            }, filter(lambda x: x[2]['weight'] > 1, ego_net.edges(data=True))))
        }

        with open('assets/data/ego_per_hour/'+day+'/'+day+'_'+str(hour)+'_'+center+'.json', 'w+') as outjson:
            json.dump(ego_json, outjson)


graph_node 
comm_dict = {}
for day in ['Fri']: #,'Sat','Sun']:
    riempiDizionarioComm(day)
    for hour in range(8,9):
        generaEgoNetwork(hour,day)