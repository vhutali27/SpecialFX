from django.contrib import admin


from .models import Player


class PlayerAdmin(admin.ModelAdmin):
    fieldsets = [
        ("player_number",                 {'fields': ['player_number']}),
        ("player_position",               {'fields': ['player_position']}),
    ]
admin.site.register(Player, PlayerAdmin)
