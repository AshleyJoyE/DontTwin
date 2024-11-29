import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
import json

class Medicine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    symptoms = ArrayField(
        models.JSONField(),
        blank=True,
        null=True
    )
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @classmethod
    def get_medicines(cls):
        return cls.objects.using('medicine').all()

    class Meta:
        db_table = 'medicine'
        app_label = 'backend'

class Logs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateTimeField(auto_now_add=True)
    medicine = models.TextField(default='[]')  # Store as JSON string
    symptoms = models.TextField()

    class Meta:
        db_table = 'logs'

    def set_medicine_ids(self, id_list):
        self.medicine = json.dumps(id_list)

    def get_medicine_ids(self):
        return json.loads(self.medicine)

class PatientMetadata(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medicine = models.TextField(default='[]')
    streak_count = models.IntegerField(default=0)
    last_logged_in = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'patient_metadata'

class Contacts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)

    class Meta:
        db_table = 'contacts'