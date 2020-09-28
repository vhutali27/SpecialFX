# TODO
'''
    Rotate The Online Players to be facing the correct way up
    Create a player django model
        Use the model values to update the player location

'''

import json

from django.shortcuts import render
from django.http import JsonResponse

# from .models import Player

player_number = 0;
active_players = {}


def home(request):
    return render(request, "SpecialFX_online/main.html")


def about(request):
    return render(request, 'SpecialFX_online/about.html')


def ajax_init(request):
    global player_number
    player_number += 1
    active_players[str(player_number)] = str(request.GET.get('position', None))
    print("\n\n\n")
    print(active_players)
    print("\n\n\n")
    return JsonResponse({"player_number" : player_number})


def ajax_handler(request):
    player_number_ = request.GET.get('player_number', None)
    position = request.GET.get("position", None)
    active_players[str(player_number)] = position # update all active player's positions

    print("\n\n\n")
    print(active_players)
    print("\n\n\n")
    return JsonResponse(active_players) # convert the python dictionary and return it to the client

