import json
import os

class DataLoader:
    _instance = None
    _data = {}

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self._load_all()

    def _load_all(self):
        self._data['questions'] = self._load_json('questions.json')
        self._data['factor_definitions'] = self._load_json('factor_definitions.json')
        self._data['scoring_maps'] = self._load_json('scoring_maps.json')

    def _load_json(self, filename):
        path = os.path.join(self.base_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def get_questions(self):
        return self._data.get('questions')

    def get_factor_definitions(self):
        return self._data.get('factor_definitions')

    def get_scoring_maps(self):
        return self._data.get('scoring_maps')
