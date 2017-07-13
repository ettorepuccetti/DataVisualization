# -*- coding: utf-8 -*-

import community
import networkx as nx
import matplotlib.pyplot as plt
from itertools import cycle
from itertools import groupby
import csv
import Demon as d
import re


def buildGraph(hour,day):
    values = []
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
    return graph



def dumpToTsc(graph):
	with open("demon/graph.tsc","w+", newline='') as outfile:
		mywriter = csv.writer(outfile, delimiter = '\t')
		for e in graph.edges(data=True):
			mywriter.writerow([ e[0],e[1],e[2]['weight'] ])

def parse(file, tipo):
	List = []
	fin = open(file)
	for line in fin:
		if tipo is 'tsc':
			t = line.split("\t")
			t2 = (t[0], t[1])
			x = tuple(t2)
			List.append(list(x))
		else:
			line = line[1:]
			x = re.findall(r'\d+', line)
			List.append(x)
	return List

def demon(graph, epsilon = 0.5, min_community_size = 3,verbose=False):

	dumpToTsc(graph)

	dm = d.Demon("demon/graph.tsc", epsilon, min_community_size, file_output=True)
	dm.execute()


def buildCommunities(g):

	edgeList = parse("demon/graph.tsc", 'tsc')
	comlist = parse("demon/communities.txt", 'txt')
	listaGrafi = {}
	communities = []
	
	for item in edgeList:
		item[1] = item[1].replace('\n','')
	
	
	for i in range(len(comlist)):
		grafoCommunity = nx.Graph()
		grafoCommunity.add_nodes_from(comlist[i])
		listOfEdges = g.edges(comlist[i])
		for el in listOfEdges[:]:
			if (el[0] not in comlist[i]) or (el[1] not in comlist[i]):
				listOfEdges.remove(el)
		grafoCommunity.add_edges_from(listOfEdges)
		listaGrafi[i] = grafoCommunity

	return listaGrafi

def plotCommunities(list_graph,verbose=None):	
      
    cycol = cycle('grcmkwb')
    for i in list_graph:
        if verbose:
            print(list_graph[i].nodes())
            print(list_graph[i].edges())
        colors = next(cycol)
        nx.draw_networkx(list_graph[i], with_labels=False, node_color = colors, edge_color = colors, node_size = 50, width = 0.3)
    
    plt.axis("off")
    plt.show()

    #ritorna la lista dei grafi (partizioni) ottenuti
    #da usare in seguito per la valutazione della qualità del partizionamento



graph = buildGraph(str(8),'Fri')
demon(graph,epsilon = 0.1) #genera i file di testo che serviranno a buildComm..
plotCommunities(buildCommunities(graph))