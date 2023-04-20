#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import datetime
import glob

import pprint

app = Flask(__name__)
CORS(app)


@app.route('/tabs', methods=['POST'])
def receive_tabs():
    data = request.get_json()
    tabs = data.get('tabs', [])

    print(f"Received {len(tabs)} tabs")

    if len(tabs) > 0:
        print(f"Contents of the first element: {tabs[0]}")

    tab_dict = {}

    for tab in tabs:
        id = tab.get('id')
        status = tab.get('status')
        url = tab.get('url')
        title = tab.get('title')

        tab_dict[id] = {
            'status': status,
            'url': url,
            'title': title
        }

    # save the data to a file with isoformat timestamp
    with open(f"tabs/{datetime.datetime.now().isoformat()}.json", 'w') as f:
        json.dump(tab_dict, f)

    print(f'Wrote {len(tab_dict)} tabs to file')

    # check_diffs()

    return jsonify({'message': 'Data received successfully'}), 200

def check_diffs():
    # get the most recent file in the tabs directory
    # get the second most recent file in the tabs directory
    # compare the two files
    tab_files = glob.glob('tabs/*.json')
    tab_files.sort()

    if len(tab_files) < 2:
        print("Not enough files to compare")
        return

    most_recent_file = tab_files[-1]
    second_most_recent_file = tab_files[-2]

    print(f"Comparing {most_recent_file} and {second_most_recent_file}")

    with open(most_recent_file, 'r') as f:
        most_recent_tabs = json.load(f)

    with open(second_most_recent_file, 'r') as f:
        second_most_recent_tabs = json.load(f)

    newest_ids = set(most_recent_tabs.keys())
    second_newest_ids = set(second_most_recent_tabs.keys())

    new_ids = newest_ids - second_newest_ids
    closed_ids = second_newest_ids - newest_ids

    print(f'new tabs: {len(new_ids)}')
    print(f'closed tabs: {len(closed_ids)}')

    print()
    for id in new_ids:
        print(f"New tab: {most_recent_tabs[id]}")

    print()
    for id in closed_ids:
        print(f"Closed tab: {second_most_recent_tabs[id]}")


if __name__ == '__main__':
    print()
    app.run(debug=True, host='localhost', port=8000)
