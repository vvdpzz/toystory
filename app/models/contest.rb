class Contest < ActiveRecord::Base
  include Extensions::UUID
  
  belongs_to :user, :counter_cache => true
  
  has_many :entries, :dependent => :destroy
  
  has_many :comments, :class_name => "Comment", :foreign_key => "pixar_id", :dependent => :destroy
  
  default_scope order("created_at DESC")
end
