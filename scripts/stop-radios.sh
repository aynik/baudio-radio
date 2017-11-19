#!/usr/bin/env bash

ps aux|grep youtube|cut -d' ' -f12|xargs kill -9
