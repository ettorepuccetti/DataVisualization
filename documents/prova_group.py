from itertools import groupby
from operator import itemgetter

values = [("animal", "bear"), ("animal", "duck"),("vehicle", "school bus"),
     ("plant", "cactus"), ("vehicle", "speed boat"), ("animal", "bear"),
     ("vehicle", "school bus"),("animal", "bear"),("plant", "cactus")]
     
    

graph_list = []
values.sort(key= lambda x : (x[0], x[1]))
grouper = lambda x: (x[0],x[1])


for key, group in groupby(values, grouper):
    graph_list.append({
        'sender': key[0],
        'receiver': key[1],
        'count': sum(1 for _ in group)
    })

print(graph_list)