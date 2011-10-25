class Profile < ActiveRecord::Base
  include Extensions::UUID
  belongs_to :user
end
