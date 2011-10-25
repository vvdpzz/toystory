class Comment < ActiveRecord::Base
  include Extensions::UUID
  belongs_to :user, :counter_cache => true
  belongs_to :contest, :class_name => "Contest", :foreign_key => "pixar_id", :counter_cache => true
  belongs_to :entry, :class_name => "Entry", :foreign_key => "pixar_id", :counter_cache => true
end
