import re
from api import *
print "Inside maintenance.py"
def re_link (request):
    
    SearchForum = 13
    Raw_Annotation_List = Annotation.objects.get(forum=SearchForum)
            
    for annotation in Raw_Annotation_List:
        potential_target=re.search("id=\"ref-an(\d+)",annotation.content)
        print m.groups()
"""
UpdateCursor = query(forum = '13',).annotations

for annotation in updatecursor:
    analysis(annotation)
    potential_links(annotation)
    for link in potential_links:
        check_and_validation
        add_link_to_database
        continue
    continue
"""
