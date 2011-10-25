class User < ActiveRecord::Base
  include Extensions::UUID
  # Include default devise modules. Others available are:
  # :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :token_authenticatable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :remember_me
  attr_accessible :authentication_token

  before_create :ensure_authentication_token
  
  has_one :profile  
  has_many :contests
  has_many :entries
  has_many :comments
end
