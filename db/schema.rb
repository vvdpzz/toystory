# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111026032809) do

  create_table "comments", :id => false, :force => true do |t|
    t.integer  "id",         :limit => 8
    t.integer  "user_id",    :limit => 8, :null => false
    t.integer  "pixar_id",   :limit => 8, :null => false
    t.text     "content"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "comments", ["pixar_id"], :name => "index_comments_on_pixar_id"
  add_index "comments", ["user_id"], :name => "index_comments_on_user_id"

  create_table "contests", :id => false, :force => true do |t|
    t.integer  "id",              :limit => 8
    t.integer  "user_id",         :limit => 8,                                                  :null => false
    t.string   "title",                                                      :default => ""
    t.text     "content"
    t.string   "rules_list",                                                 :default => ""
    t.string   "customized_rule",                                            :default => ""
    t.decimal  "credits",                      :precision => 8, :scale => 2, :default => 0.0
    t.integer  "reputation",                                                 :default => 0
    t.boolean  "is_blind",                                                   :default => false
    t.boolean  "is_community",                                               :default => false
    t.integer  "end_date",                                                   :default => 0
    t.integer  "votes_count",                                                :default => 0
    t.integer  "entries_count",                                              :default => 0
    t.integer  "comments_count",                                             :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "contests", ["user_id"], :name => "index_contests_on_user_id"

  create_table "entries", :id => false, :force => true do |t|
    t.integer  "id",             :limit => 8
    t.integer  "user_id",        :limit => 8,                    :null => false
    t.integer  "contest_id",     :limit => 8,                    :null => false
    t.text     "content"
    t.boolean  "is_correct",                  :default => false
    t.boolean  "is_eliminate",                :default => false
    t.integer  "votes_count",                 :default => 0
    t.integer  "comments_count",              :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "entries", ["contest_id"], :name => "index_entries_on_contest_id"
  add_index "entries", ["user_id"], :name => "index_entries_on_user_id"

  create_table "profiles", :id => false, :force => true do |t|
    t.integer  "id",           :limit => 8
    t.integer  "user_id",      :limit => 8, :null => false
    t.string   "description"
    t.string   "location"
    t.text     "introduction"
    t.string   "website"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "profiles", ["user_id"], :name => "index_profiles_on_user_id"

  create_table "recharge_records", :id => false, :force => true do |t|
    t.integer  "id",           :limit => 8
    t.integer  "user_id",      :limit => 8,                                                :null => false
    t.decimal  "credits",                   :precision => 8, :scale => 2, :default => 0.0
    t.integer  "trade_type",                                              :default => 0
    t.integer  "trade_status",                                            :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "recharge_records", ["user_id"], :name => "index_recharge_records_on_user_id"

  create_table "users", :primary_key => "email", :force => true do |t|
    t.integer  "id",                     :limit => 8
    t.string   "username",                                                            :default => ""
    t.string   "picture",                                                             :default => ""
    t.string   "salt"
    t.string   "encrypted_password",     :limit => 128,                               :default => "",  :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                                                       :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.decimal  "credits",                               :precision => 8, :scale => 2, :default => 0.0
    t.integer  "reputation",                                                          :default => 0
    t.integer  "contests_count",                                                      :default => 0
    t.integer  "entries_count",                                                       :default => 0
    t.integer  "comments_count",                                                      :default => 0
    t.string   "authentication_token"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["authentication_token"], :name => "index_users_on_authentication_token", :unique => true
  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
