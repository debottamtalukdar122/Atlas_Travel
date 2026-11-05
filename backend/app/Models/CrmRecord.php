<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CrmRecord extends Model { protected $table='crm_records'; protected $fillable=['module','payload']; protected $casts=['payload'=>'array']; }
